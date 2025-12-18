import { NextRequest } from "next/server";
import { handleApi } from "@/lib/route-helpers";
import { ApiError } from "@/lib/errors";
import { assertAuthenticated } from "@/lib/session";
import { auditLog, getDb, newId, sendDevEmail, userRoles } from "@/lib/db";
import { ROLE_ADMIN, ROLE_SUPER_ADMIN, ROLE_USER, USER_STATUS_ACTIVE, USER_STATUS_DELETED, USER_STATUS_PENDING } from "@/lib/constants";
import { jsonResponse, getClientIp } from "@/lib/http";
import { isValidEmail, normalizeEmail, passwordHashSync, randomToken, sha256Hex } from "@/lib/security";
import { nowTs } from "@/lib/time";

const ensureAdmin = (req: NextRequest) => {
  const session = assertAuthenticated(req);
  const conn = getDb();
  const roles = userRoles(conn, session.user_id);
  if (!roles.includes(ROLE_ADMIN) && !roles.includes(ROLE_SUPER_ADMIN)) {
    throw new ApiError(403, "FORBIDDEN", "Admin role required");
  }
  return { conn, session };
};

export async function GET(req: NextRequest) {
  return handleApi(req, async () => {
    const { conn } = ensureAdmin(req);
    const ts = nowTs();

    interface InviteRow {
      id: string;
      email: string;
      display_name: string;
      status: string;
      created_at: number;
    }

    const rows = conn
      .prepare(
        "SELECT id, email, display_name, status, created_at FROM users WHERE status IN (?, ?, ?) ORDER BY created_at DESC LIMIT 200"
      )
      .all(USER_STATUS_PENDING, USER_STATUS_ACTIVE, USER_STATUS_DELETED) as InviteRow[];

    const invites = rows.map((row) => {
      const token = conn
        .prepare(
          "SELECT created_at, expires_at, used_at FROM email_verification_tokens WHERE user_id = ? ORDER BY created_at DESC LIMIT 1"
        )
        .get(row.id) as { created_at: number; expires_at: number; used_at: number | null } | undefined;
      const roleRows = conn
        .prepare("SELECT role_name FROM user_roles WHERE user_id = ? ORDER BY role_name ASC")
        .all(row.id) as { role_name: string }[];

      let status = "SENT";
      if (row.status === USER_STATUS_DELETED) status = "REVOKED";
      else if (row.status === USER_STATUS_ACTIVE || token?.used_at) status = "ACCEPTED";
      else if (token && token.expires_at < ts) status = "EXPIRED";
      else if (row.status === USER_STATUS_PENDING) status = "PENDING";

      return {
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        role: roleRows.map((r) => r.role_name)[0] || ROLE_USER,
        sentAt: token?.created_at || row.created_at,
        expiresAt: token?.expires_at || null,
        status
      };
    });

    return jsonResponse(200, { invites });
  });
}

export async function POST(req: NextRequest) {
  return handleApi(req, async () => {
    const { conn, session } = ensureAdmin(req);
    const body = await req.json();
    const emailRaw = String(body.email || "").trim();
    const role = String(body.role || ROLE_USER).trim().toUpperCase();
    const displayName = String(body.displayName || "").trim() || "User";
    const resendUserId = String(body.userId || "").trim();
    const ts = nowTs();

    if (resendUserId) {
      const user = conn
        .prepare("SELECT email, status FROM users WHERE id = ?")
        .get(resendUserId) as { email: string; status: string } | undefined;
      if (!user) throw new ApiError(404, "NOT_FOUND", "Invite not found");
      if (user.status === USER_STATUS_DELETED) throw new ApiError(400, "INVITE_REVOKED", "Invite already revoked");

      const rawToken = randomToken(32);
      conn
        .prepare(
          "INSERT INTO email_verification_tokens (id, user_id, token_hash, created_at, expires_at, used_at) VALUES (?, ?, ?, ?, ?, NULL)"
        )
        .run(newId(), resendUserId, sha256Hex(rawToken), ts, ts + 24 * 3600 * 7);
      const link = `${req.nextUrl.origin}/verify-email?token=${encodeURIComponent(rawToken)}`;
      sendDevEmail(conn, {
        toEmail: user.email,
        subject: "Invitation resent",
        body: `You have a pending invitation.\n\nUse this link to join:\n${link}\n`
      });
      conn.prepare("UPDATE users SET status = ?, updated_at = ? WHERE id = ?").run(USER_STATUS_PENDING, ts, resendUserId);
      auditLog(conn, {
        action: "INVITE_RESENT",
        actorUserId: session.user_id,
        targetUserId: resendUserId,
        ip: getClientIp(req)
      });
      return jsonResponse(200, { ok: true });
    }

    if (!isValidEmail(emailRaw)) throw new ApiError(400, "VALIDATION_FAILED", "Invalid email");
    const emailNorm = normalizeEmail(emailRaw);

    const existing = conn.prepare("SELECT id, status FROM users WHERE email_norm = ?").get(emailNorm) as
      | { id: string; status: string }
      | undefined;
    if (existing && existing.status !== USER_STATUS_DELETED) {
      throw new ApiError(409, "CONFLICT", "User already exists");
    }

    const userId = existing?.id || newId();
    const passwordHash = passwordHashSync(randomToken(16));

    const inviteTx = conn.transaction(() => {
      if (!existing) {
        conn
          .prepare(
            "INSERT INTO users (id, email, email_norm, email_verified_at, password_hash, status, display_name, created_at, updated_at) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?)"
          )
          .run(userId, emailRaw, emailNorm, passwordHash, USER_STATUS_PENDING, displayName, ts, ts);
      } else {
        conn
          .prepare(
            "UPDATE users SET email = ?, email_norm = ?, password_hash = ?, status = ?, display_name = ?, updated_at = ?, email_verified_at = NULL WHERE id = ?"
          )
          .run(emailRaw, emailNorm, passwordHash, USER_STATUS_PENDING, displayName, ts, userId);
        conn.prepare("DELETE FROM email_verification_tokens WHERE user_id = ?").run(userId);
      }

      conn
        .prepare("INSERT OR REPLACE INTO user_roles (user_id, role_name, assigned_by_user_id, assigned_at) VALUES (?, ?, ?, ?)")
        .run(userId, role || ROLE_USER, session.user_id, ts);

      const rawToken = randomToken(32);
      conn
        .prepare(
          "INSERT INTO email_verification_tokens (id, user_id, token_hash, created_at, expires_at, used_at) VALUES (?, ?, ?, ?, ?, NULL)"
        )
        .run(newId(), userId, sha256Hex(rawToken), ts, ts + 24 * 3600 * 7);

      const link = `${req.nextUrl.origin}/verify-email?token=${encodeURIComponent(rawToken)}`;
      sendDevEmail(conn, {
        toEmail: emailRaw,
        subject: "You have been invited",
        body: `You have been invited to join the platform.\n\nClick here to accept:\n${link}\n`
      });

      auditLog(conn, {
        action: "USER_INVITED",
        actorUserId: session.user_id,
        targetUserId: userId,
        ip: getClientIp(req),
        metadata: { email: emailRaw, role }
      });
    });

    inviteTx();
    return jsonResponse(201, { ok: true, id: userId, status: USER_STATUS_PENDING });
  });
}
