import { NextRequest } from "next/server";
import { handleApi } from "@/lib/route-helpers";
import { ApiError } from "@/lib/errors";
import { assertAuthenticated } from "@/lib/session";
import { auditLog, getDb, userRoles } from "@/lib/db";
import { ROLE_ADMIN, ROLE_SUPER_ADMIN, ROLE_USER } from "@/lib/constants";
import { jsonResponse, getClientIp } from "@/lib/http";
import { nowTs } from "@/lib/time";

const PROTECTED_ROLES = [ROLE_ADMIN, ROLE_SUPER_ADMIN, ROLE_USER];

export async function PATCH(req: NextRequest, { params }: { params: { name: string } }) {
  return handleApi(req, async () => {
    const { conn, session } = await requireAdmin(req);
    const name = params.name?.toUpperCase();
    if (!name) throw new ApiError(400, "INVALID_REQUEST", "Role name required");

    const body = await req.json();
    const description = typeof body.description === "string" ? body.description.trim() : undefined;
    const permissions = normalizePermissions(body.permissions);
    if (permissions.length === 0) throw new ApiError(400, "VALIDATION_FAILED", "At least one permission is required");

    const existing = await conn.prepare("SELECT name FROM roles WHERE name = ?").get(name);
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Role not found");

    const ts = nowTs();
    await conn
      .prepare("UPDATE roles SET description = ?, permissions_json = ?, updated_at = ? WHERE name = ?")
      .run(description || "", JSON.stringify(permissions), ts, name);

    await auditLog(conn, {
      action: "ROLE_UPDATED",
      actorUserId: session.user_id,
      targetUserId: null,
      ip: getClientIp(req),
      metadata: { name, permissions }
    });

    return jsonResponse(200, { ok: true });
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { name: string } }) {
  return handleApi(req, async () => {
    const { conn, session } = await requireAdmin(req);
    const name = params.name?.toUpperCase();
    if (!name) throw new ApiError(400, "INVALID_REQUEST", "Role name required");
    if (PROTECTED_ROLES.includes(name)) throw new ApiError(400, "FORBIDDEN", "Protected roles cannot be deleted");

    const existing = await conn.prepare("SELECT name FROM roles WHERE name = ?").get(name);
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Role not found");

    const tx = conn.transaction(async (txn) => {
      await txn.prepare("DELETE FROM roles WHERE name = ?").run(name);
      await txn.prepare("DELETE FROM user_roles WHERE role_name = ?").run(name);
    });
    await tx();

    await auditLog(conn, {
      action: "ROLE_DELETED",
      actorUserId: session.user_id,
      targetUserId: null,
      ip: getClientIp(req),
      metadata: { name }
    });

    return jsonResponse(200, { ok: true });
  });
}

const requireAdmin = async (req: NextRequest) => {
  const session = await assertAuthenticated(req);
  const conn = getDb();
  const roles = await userRoles(conn, session.user_id);
  if (!roles.includes(ROLE_ADMIN) && !roles.includes(ROLE_SUPER_ADMIN)) {
    throw new ApiError(403, "FORBIDDEN", "Admin role required");
  }
  return { conn, session };
};

const normalizePermissions = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map(String).map((p) => p.trim()).filter(Boolean);
  }
  const raw = String(value || "").trim();
  if (!raw) return [];
  return raw.split(",").map((p) => p.trim()).filter(Boolean);
};
