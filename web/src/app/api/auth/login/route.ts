import { NextRequest } from "next/server";
import { handleApi } from "@/lib/route-helpers";
import { ApiError } from "@/lib/errors";
import { getDb, auditLog, userRoles } from "@/lib/db";
import { normalizeEmail, passwordVerify } from "@/lib/security";
import { jsonResponse } from "@/lib/http";
import { USER_STATUS_DELETED, USER_STATUS_DISABLED } from "@/lib/constants";
import { createSession } from "@/lib/session";
import { isoTs, nowTs } from "@/lib/time";

export async function POST(req: NextRequest) {
  return handleApi(req, async () => {
    const body = await req.json();
    const identifier = String(body?.identifier || "").trim();
    const password = String(body?.password || "");
    const rememberMe = Boolean(body?.rememberMe);

    interface User {
      id: string;
      status: string;
      email: string;
      email_verified_at: number | null;
      password_hash: string | null;
    }

    const conn = getDb();
    const user = conn.prepare("SELECT * FROM users WHERE email_norm = ?").get(normalizeEmail(identifier)) as User | undefined;
    if (!user) throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid credentials");
    if (user.status === USER_STATUS_DISABLED) throw new ApiError(403, "ACCOUNT_DISABLED", "Account disabled");
    if (user.status === USER_STATUS_DELETED) throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid credentials");
    if (!user.email_verified_at) throw new ApiError(403, "EMAIL_NOT_VERIFIED", "Email not verified. Check the dev outbox.");
    const stored = user.password_hash || "";
    if (!stored || !(await passwordVerify(password, stored))) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid credentials");
    }

    const session = createSession({ userId: user.id, remember: rememberMe, req });
    const ts = nowTs();
    conn.prepare("UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?").run(ts, ts, user.id);
    auditLog(conn, { action: "LOGIN_SUCCESS", actorUserId: user.id, targetUserId: user.id, ip: req.ip });

    return jsonResponse(
      200,
      {
        user: { id: user.id, email: user.email, status: user.status, roles: userRoles(conn, user.id) },
        session: { id: session.sessionId, expiresAt: isoTs(session.expiresAt) }
      },
      { cookies: session.cookies }
    );
  });
}
