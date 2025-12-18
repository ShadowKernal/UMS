import { NextRequest } from "next/server";
import { handleApi } from "@/lib/route-helpers";
import { ApiError } from "@/lib/errors";
import { auditLog, getDb, userRoles } from "@/lib/db";
import { ROLE_ADMIN, ROLE_SUPER_ADMIN, USER_STATUS_ACTIVE, USER_STATUS_DISABLED, USER_STATUS_PENDING } from "@/lib/constants";
import { assertAuthenticated } from "@/lib/session";
import { jsonResponse, getClientIp } from "@/lib/http";
import { nowTs } from "@/lib/time";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApi(req, async () => {
    const { conn } = requireAdmin(req);
    const userId = params.id;
    if (!userId) throw new ApiError(400, "INVALID_REQUEST", "User ID required");

    const user = conn
      .prepare("SELECT id, email, display_name, status, created_at, updated_at, last_login_at FROM users WHERE id = ?")
      .get(userId) as
      | { id: string; email: string; display_name: string; status: string; created_at: number; updated_at: number; last_login_at: number | null }
      | undefined;
    if (!user) throw new ApiError(404, "NOT_FOUND", "User not found");

    const roles = conn
      .prepare("SELECT role_name FROM user_roles WHERE user_id = ? ORDER BY role_name ASC")
      .all(userId) as { role_name: string }[];
    const groups = conn
      .prepare(
        "SELECT g.id, g.name FROM group_members gm JOIN groups g ON g.id = gm.group_id WHERE gm.user_id = ? ORDER BY g.name ASC"
      )
      .all(userId) as Array<{ id: string; name: string }>;
    const sessions = conn
      .prepare(
        "SELECT id, last_seen_at, ip, user_agent, created_at, expires_at FROM sessions WHERE user_id = ? AND revoked_at IS NULL ORDER BY last_seen_at DESC"
      )
      .all(userId) as Array<{ id: string; last_seen_at: number; ip: string | null; user_agent: string | null; created_at: number; expires_at: number }>;

    return jsonResponse(200, {
      user: {
        ...user,
        roles: roles.map((r) => r.role_name),
        groups,
        sessions
      }
    });
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApi(req, async () => {
    const { conn, session } = requireAdmin(req);
    const userId = params.id;
    if (!userId) throw new ApiError(400, "INVALID_REQUEST", "User ID required");

    const body = await req.json();
    const status = typeof body.status === "string" ? body.status.trim().toUpperCase() : undefined;
    const displayName = typeof body.displayName === "string" ? body.displayName.trim() : undefined;
    if (!status && !displayName) throw new ApiError(400, "INVALID_REQUEST", "Nothing to update");

    const allowedStatuses = [USER_STATUS_ACTIVE, USER_STATUS_DISABLED, USER_STATUS_PENDING];
    if (status && !allowedStatuses.includes(status)) {
      throw new ApiError(400, "VALIDATION_FAILED", "Unsupported status");
    }

    const user = conn.prepare("SELECT status FROM users WHERE id = ?").get(userId) as { status: string } | undefined;
    if (!user) throw new ApiError(404, "NOT_FOUND", "User not found");

    const ts = nowTs();
    conn
      .prepare("UPDATE users SET status = COALESCE(?, status), display_name = COALESCE(?, display_name), updated_at = ? WHERE id = ?")
      .run(status || null, displayName || null, ts, userId);
    if (status === USER_STATUS_DISABLED) {
      conn.prepare("UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL").run(ts, userId);
    }

    auditLog(conn, {
      action: "USER_UPDATED",
      actorUserId: session.user_id,
      targetUserId: userId,
      ip: getClientIp(req),
      metadata: { status, displayName }
    });

    return jsonResponse(200, { ok: true });
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApi(req, async () => {
    const { conn, session } = requireAdmin(req);
    const userId = params.id;
    if (!userId) throw new ApiError(400, "INVALID_REQUEST", "User ID required");

    const user = conn.prepare("SELECT status FROM users WHERE id = ?").get(userId) as { status: string } | undefined;
    if (!user) throw new ApiError(404, "NOT_FOUND", "User not found");

    const deleteTx = conn.transaction(() => {
      // Hard delete user; cascading FKs will clean up related rows.
      conn.prepare("DELETE FROM users WHERE id = ?").run(userId);

      auditLog(conn, {
        action: "USER_DELETED",
        actorUserId: session.user_id,
        targetUserId: userId,
        ip: getClientIp(req)
      });
    });

    deleteTx();

    return jsonResponse(200, { ok: true });
  });
}

const requireAdmin = (req: NextRequest) => {
  const session = assertAuthenticated(req);
  const conn = getDb();
  const roles = userRoles(conn, session.user_id);
  if (!roles.includes(ROLE_ADMIN) && !roles.includes(ROLE_SUPER_ADMIN)) {
    throw new ApiError(403, "FORBIDDEN", "Admin role required");
  }
  return { conn, session };
};
