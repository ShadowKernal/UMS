import { NextRequest } from "next/server";
import { handleApi } from "@/lib/route-helpers";
import { ApiError } from "@/lib/errors";
import { getDb, auditLog } from "@/lib/db";
import { sha256Hex, passwordHashSync } from "@/lib/security";
import { getClientIp } from "@/lib/http";
import { nowTs } from "@/lib/time";
import { USER_STATUS_ACTIVE, USER_STATUS_DISABLED, USER_STATUS_DELETED } from "@/lib/constants";
import { jsonResponse } from "@/lib/http";

export async function POST(req: NextRequest) {
  return handleApi(req, async () => {
    const body = await req.json();
    const token = String(body?.token || "").trim();
    const newPassword = String(body?.password || "");

    if (!token) throw new ApiError(400, "INVALID_REQUEST", "Token required");
    if (newPassword.length < 8) throw new ApiError(422, "VALIDATION_FAILED", "Password must be at least 8 characters");
    if (newPassword.length > 128) throw new ApiError(422, "VALIDATION_FAILED", "Password must be at most 128 characters");

    const conn = getDb();
    const ts = nowTs();
    interface ResetTokenRow {
      id: string;
      user_id: string;
      status: string;
    }

    const row = conn
      .prepare(
        `
        SELECT t.*, u.status
        FROM password_reset_tokens t
        JOIN users u ON u.id = t.user_id
        WHERE t.token_hash = ? AND t.used_at IS NULL AND t.expires_at > ?
      `
      )
      .get(sha256Hex(token), ts) as ResetTokenRow | undefined;
    if (!row) throw new ApiError(400, "INVALID_TOKEN", "Invalid or expired token");
    if (row.status === USER_STATUS_DISABLED || row.status === USER_STATUS_DELETED) {
      throw new ApiError(403, "ACCOUNT_DISABLED", "Account disabled");
    }

    const updateTx = conn.transaction(() => {
      conn.prepare("UPDATE password_reset_tokens SET used_at = ? WHERE id = ?").run(ts, row.id);
      conn
        .prepare("UPDATE users SET password_hash = ?, status = ?, updated_at = ? WHERE id = ?")
        .run(passwordHashSync(newPassword), USER_STATUS_ACTIVE, ts, row.user_id);
      auditLog(conn, { action: "PASSWORD_RESET", actorUserId: row.user_id, targetUserId: row.user_id, ip: getClientIp(req) });
    });
    updateTx();

    return jsonResponse(200, { ok: true });
  });
}
