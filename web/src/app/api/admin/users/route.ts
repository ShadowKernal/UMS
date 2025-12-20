import { NextRequest } from "next/server";
import { handleApi } from "@/lib/route-helpers";
import { assertAuthenticated } from "@/lib/session";
import { ApiError } from "@/lib/errors";
import { getDb, userRoles, newId, auditLog, sendDevEmail } from "@/lib/db";
import { ROLE_ADMIN, ROLE_SUPER_ADMIN, ROLE_USER, USER_STATUS_PENDING } from "@/lib/constants";
import { jsonResponse, getClientIp } from "@/lib/http";
import { isValidEmail, normalizeEmail, passwordHashSync, randomToken, generateCode, sha256Hex } from "@/lib/security";
import { nowTs } from "@/lib/time";

export async function GET(req: NextRequest) {
  return handleApi(req, async () => {
    const session = await assertAuthenticated(req);
    const conn = getDb();
    const roles = await userRoles(conn, session.user_id);
    if (!roles.includes(ROLE_ADMIN) && !roles.includes(ROLE_SUPER_ADMIN)) {
      throw new ApiError(403, "FORBIDDEN", "Admin role required");
    }

    interface User {
      id: string;
      email: string;
      status: string;
      display_name: string | null;
      created_at: string;
      updated_at: string;
    }

    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1") || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.nextUrl.searchParams.get("limit") || "50") || 50));
    const offset = (page - 1) * limit;

    const users = (await conn
      .prepare("SELECT id, email, status, display_name, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?")
      .all(limit, offset)) as User[];
    const allUserIds = users.map(u => u.id);
    const allRolesMap = new Map<string, string[]>();

    if (allUserIds.length > 0) {
      // Fetch all roles for all users in one query
      const rolesQuery = (await conn
        .prepare(`SELECT user_id, role_name as role FROM user_roles WHERE user_id IN (${allUserIds.map(() => '?').join(',')})`)
        .all(...allUserIds)) as Array<{ user_id: string; role: string }>;

      rolesQuery.forEach(row => {
        if (!allRolesMap.has(row.user_id)) {
          allRolesMap.set(row.user_id, []);
        }
        allRolesMap.get(row.user_id)!.push(row.role);
      });
    }

    return jsonResponse(200, {
      users: users.map((u) => ({
        ...u,
        roles: allRolesMap.get(u.id) || []
      }))
    });
  });

}

export async function POST(req: NextRequest) {
  return handleApi(req, async () => {
    const session = await assertAuthenticated(req);
    const conn = getDb();
    const roles = await userRoles(conn, session.user_id);
    if (!roles.includes(ROLE_ADMIN) && !roles.includes(ROLE_SUPER_ADMIN)) {
      throw new ApiError(403, "FORBIDDEN", "Admin role required");
    }

    const body = await req.json();
    const email = String(body.email || "").trim();
    const role = String(body.role || ROLE_USER).trim();
    const displayName = String(body.displayName || "").trim() || "User";

    if (!isValidEmail(email)) throw new ApiError(400, "VALIDATION_FAILED", "Invalid email");

    const emailNorm = normalizeEmail(email);
    const existing = await conn.prepare("SELECT id FROM users WHERE email_norm = ?").get(emailNorm);
    if (existing) throw new ApiError(409, "CONFLICT", "User already exists");

    const userId = newId();
    const ts = nowTs();
    const passwordHash = passwordHashSync(randomToken(16)); // Random password for invited users

    const inviteTx = conn.transaction(async (tx) => {
      await tx
        .prepare(
          "INSERT INTO users (id, email, email_norm, email_verified_at, password_hash, status, display_name, created_at, updated_at) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?)"
        )
        .run(userId, email, emailNorm, passwordHash, USER_STATUS_PENDING, displayName, ts, ts);

      await tx
        .prepare("INSERT INTO user_roles (user_id, role_name, assigned_by_user_id, assigned_at) VALUES (?, ?, ?, ?)")
        .run(userId, role, session.user_id, ts);

      const rawToken = generateCode(9);
      await tx
        .prepare(
          "INSERT INTO email_verification_tokens (id, user_id, token_hash, created_at, expires_at, used_at) VALUES (?, ?, ?, ?, ?, NULL)"
        )
        .run(newId(), userId, sha256Hex(rawToken), ts, ts + 24 * 3600 * 7); // 7 days for invites

      const inviteLink = `${req.nextUrl.origin}/verify-email?token=${encodeURIComponent(rawToken)}`;
      await sendDevEmail(tx, {
        toEmail: email,
        subject: "You have been invited",
        body: `You have been invited to join the platform.\n\nClick here to accept:\n${inviteLink}\n`
      });

      await auditLog(tx, {
        action: "USER_INVITED",
        actorUserId: session.user_id,
        targetUserId: userId,
        ip: getClientIp(req),
        metadata: { email, role }
      });
    });

    await inviteTx();

    return jsonResponse(201, { ok: true, id: userId });
  });
}
