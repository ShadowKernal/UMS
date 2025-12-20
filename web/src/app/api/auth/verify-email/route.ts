import { NextRequest } from "next/server";
import { handleApi } from "@/lib/route-helpers";
import { ApiError } from "@/lib/errors";
import { getDb, auditLog } from "@/lib/db";
import { getClientIp } from "@/lib/http";
import { sha256Hex } from "@/lib/security";
import { nowTs } from "@/lib/time";
import { USER_STATUS_ACTIVE, USER_STATUS_DISABLED } from "@/lib/constants";
import { jsonResponse } from "@/lib/http";

export async function POST(req: NextRequest) {
  return handleApi(req, async () => {
    const body = await req.json();
    const token = String(body?.token || "").trim();
    if (!token) throw new ApiError(400, "INVALID_REQUEST", "Token required");

    const conn = getDb();
    const tokenHash = sha256Hex(token);
    const ts = nowTs();
    interface VerifyTokenRow {
      id: string;
      user_id: string;
      status: string;
    }

    const row = (await conn
      .prepare(
        `
        SELECT t.*, u.status
        FROM email_verification_tokens t
        JOIN users u ON u.id = t.user_id
        WHERE t.token_hash = ? AND t.used_at IS NULL AND t.expires_at > ?
      `
      )
      .get(tokenHash, ts)) as VerifyTokenRow | undefined;
    if (!row) throw new ApiError(400, "INVALID_TOKEN", "Invalid or expired token");

    const verifyTx = conn.transaction(async (tx) => {
      await tx.prepare("UPDATE email_verification_tokens SET used_at = ? WHERE id = ?").run(ts, row.id);
      await tx
        .prepare(
          "UPDATE users SET email_verified_at = ?, status = ?, updated_at = ? WHERE id = ? AND status != ?"
        )
        .run(ts, USER_STATUS_ACTIVE, ts, row.user_id, USER_STATUS_DISABLED);
      await auditLog(tx, { action: "EMAIL_VERIFIED", actorUserId: null, targetUserId: row.user_id, ip: getClientIp(req) });
      return USER_STATUS_ACTIVE;
    });

    const newStatus = await verifyTx();
    return jsonResponse(200, { status: newStatus });
  });
}
