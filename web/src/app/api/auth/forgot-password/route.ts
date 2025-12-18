import { NextRequest } from "next/server";
import { handleApi } from "@/lib/route-helpers";
import { ApiError } from "@/lib/errors";
import { normalizeEmail, randomToken, sha256Hex } from "@/lib/security";
import { getDb, newId, sendDevEmail, auditLog } from "@/lib/db";
import { nowTs } from "@/lib/time";
import { USER_STATUS_DELETED, USER_STATUS_DISABLED } from "@/lib/constants";
import { jsonResponse } from "@/lib/http";

import { getClientIp } from "@/lib/http";

const getBaseUrl = (req: NextRequest) => {
  return req.nextUrl.origin;
};

export async function POST(req: NextRequest) {
  return handleApi(req, async () => {
    const body = await req.json();
    const identifier = String(body?.identifier || "").trim();
    if (!identifier) throw new ApiError(400, "INVALID_REQUEST", "Identifier required");

    const conn = getDb();
    const ts = nowTs();
    interface User {
      id: string;
      status: string;
      email: string;
    }

    const user = conn.prepare("SELECT * FROM users WHERE email_norm = ?").get(normalizeEmail(identifier)) as User | undefined;
    if (user && user.status !== USER_STATUS_DISABLED && user.status !== USER_STATUS_DELETED) {
      const rawToken = randomToken(18);
      conn
        .prepare(
          "INSERT INTO password_reset_tokens (id, user_id, token_hash, created_at, expires_at, used_at, requested_from_ip) VALUES (?, ?, ?, ?, ?, NULL, ?)"
        )
        .run(newId(), user.id, sha256Hex(rawToken), ts, ts + 3600, getClientIp(req));
      const resetLink = `${getBaseUrl(req)}/reset-password?token=${encodeURIComponent(rawToken)}`;
      sendDevEmail(conn, {
        toEmail: user.email,
        subject: "Password reset",
        body: `Your password reset code:\n\n${rawToken}\n\nOr open:\n${resetLink}\n`
      });
      auditLog(conn, { action: "PASSWORD_RESET_REQUESTED", actorUserId: user.id, targetUserId: user.id, ip: getClientIp(req) });
    }

    return jsonResponse(202, { ok: true });
  });
}
