import { NextRequest } from "next/server";
import { handleApi } from "@/lib/route-helpers";
import { ApiError } from "@/lib/errors";
import { assertAuthenticated } from "@/lib/session";
import { auditLog, getDb, userRoles } from "@/lib/db";
import { ROLE_ADMIN, ROLE_SUPER_ADMIN, USER_STATUS_DELETED } from "@/lib/constants";
import { jsonResponse, getClientIp } from "@/lib/http";
import { nowTs } from "@/lib/time";

const requireAdmin = (req: NextRequest) => {
  const session = assertAuthenticated(req);
  const conn = getDb();
  const roles = userRoles(conn, session.user_id);
  if (!roles.includes(ROLE_ADMIN) && !roles.includes(ROLE_SUPER_ADMIN)) {
    throw new ApiError(403, "FORBIDDEN", "Admin role required");
  }
  return { conn, session };
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApi(req, async () => {
    const { conn } = requireAdmin(req);
    const id = params.id;
    const group = conn
      .prepare("SELECT id, name, description, created_at, updated_at FROM groups WHERE id = ?")
      .get(id) as { id: string; name: string; description: string | null; created_at: number; updated_at: number } | undefined;
    if (!group) throw new ApiError(404, "NOT_FOUND", "Group not found");

    const members = conn
      .prepare(
        `
        SELECT u.id, u.display_name, u.email, u.status, gm.added_at
        FROM group_members gm
        JOIN users u ON u.id = gm.user_id
        WHERE gm.group_id = ?
        ORDER BY gm.added_at DESC
      `
      )
      .all(id) as Array<{ id: string; display_name: string; email: string; status: string; added_at: number }>;

    return jsonResponse(200, { group: { ...group, description: group.description || "", members } });
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApi(req, async () => {
    const { conn, session } = requireAdmin(req);
    const id = params.id;
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : undefined;
    const description = typeof body.description === "string" ? body.description.trim() : undefined;
    if (!name && !description) throw new ApiError(400, "INVALID_REQUEST", "Nothing to update");

    const existing = conn.prepare("SELECT id FROM groups WHERE id = ?").get(id);
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Group not found");

    const ts = nowTs();
    conn
      .prepare("UPDATE groups SET name = COALESCE(?, name), description = COALESCE(?, description), updated_at = ? WHERE id = ?")
      .run(name || null, description || null, ts, id);

    auditLog(conn, {
      action: "GROUP_UPDATED",
      actorUserId: session.user_id,
      targetUserId: null,
      ip: getClientIp(req),
      metadata: { id }
    });

    return jsonResponse(200, { ok: true });
  });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApi(req, async () => {
    const { conn, session } = requireAdmin(req);
    const groupId = params.id;
    const body = await req.json();
    const action = String(body.action || "").trim();
    const userId = String(body.userId || "").trim();
    const ts = nowTs();

    if (!action) throw new ApiError(400, "INVALID_REQUEST", "Action is required");
    const group = conn.prepare("SELECT id FROM groups WHERE id = ?").get(groupId);
    if (!group) throw new ApiError(404, "NOT_FOUND", "Group not found");

    if (action === "add-member") {
      if (!userId) throw new ApiError(400, "VALIDATION_FAILED", "User ID is required");
      const user = conn.prepare("SELECT status FROM users WHERE id = ?").get(userId) as { status: string } | undefined;
      if (!user) throw new ApiError(404, "NOT_FOUND", "User not found");
      if (user.status === USER_STATUS_DELETED) throw new ApiError(400, "VALIDATION_FAILED", "Cannot add deleted user");
      conn.prepare("INSERT OR IGNORE INTO group_members (group_id, user_id, added_at) VALUES (?, ?, ?)").run(groupId, userId, ts);
      auditLog(conn, {
        action: "GROUP_MEMBER_ADDED",
        actorUserId: session.user_id,
        targetUserId: userId,
        ip: getClientIp(req),
        metadata: { groupId }
      });
      return jsonResponse(200, { ok: true });
    }

    if (action === "remove-member") {
      if (!userId) throw new ApiError(400, "VALIDATION_FAILED", "User ID is required");
      conn.prepare("DELETE FROM group_members WHERE group_id = ? AND user_id = ?").run(groupId, userId);
      auditLog(conn, {
        action: "GROUP_MEMBER_REMOVED",
        actorUserId: session.user_id,
        targetUserId: userId,
        ip: getClientIp(req),
        metadata: { groupId }
      });
      return jsonResponse(200, { ok: true });
    }

    throw new ApiError(400, "INVALID_REQUEST", "Unsupported action");
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApi(req, async () => {
    const { conn, session } = requireAdmin(req);
    const groupId = params.id;
    const existing = conn.prepare("SELECT id FROM groups WHERE id = ?").get(groupId);
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Group not found");

    conn.prepare("DELETE FROM groups WHERE id = ?").run(groupId);
    auditLog(conn, {
      action: "GROUP_DELETED",
      actorUserId: session.user_id,
      targetUserId: null,
      ip: getClientIp(req),
      metadata: { groupId }
    });
    return jsonResponse(200, { ok: true });
  });
}
