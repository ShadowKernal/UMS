import { NextRequest } from "next/server";
import { handleApi } from "@/lib/route-helpers";
import { ApiError } from "@/lib/errors";
import { assertAuthenticated } from "@/lib/session";
import { auditLog, getDb, userRoles } from "@/lib/db";
import { ROLE_ADMIN, ROLE_SUPER_ADMIN, ROLE_USER } from "@/lib/constants";
import { jsonResponse, getClientIp } from "@/lib/http";
import { nowTs } from "@/lib/time";

export async function GET(req: NextRequest) {
  return handleApi(req, async () => {
    const { conn } = await requireAdmin(req);

    const rolesTable = (await conn
      .prepare("SELECT name, description, permissions_json, created_at, updated_at FROM roles ORDER BY name ASC")
      .all()) as Array<{ name: string; description: string | null; permissions_json: string; created_at: number; updated_at: number }>;
    const counts = (await conn
      .prepare("SELECT role_name as name, COUNT(user_id) as users FROM user_roles GROUP BY role_name")
      .all()) as Array<{ name: string; users: number }>;

    const countsMap = new Map<string, number>();
    counts.forEach((r) => countsMap.set(r.name, Number(r.users || 0)));

    const existingNames = new Set(rolesTable.map((r) => r.name));
    const enrichedRoles = [
      ...rolesTable.map((r) => ({
        id: r.name,
        name: r.name,
        description: r.description || "",
        permissions: safeParsePermissions(r.permissions_json),
        users: countsMap.get(r.name) || 0,
        created_at: r.created_at,
        updated_at: r.updated_at
      })),
      // Include roles assigned to users even if missing metadata
      ...counts
        .filter((r) => !existingNames.has(r.name))
        .map((r) => ({
          id: r.name,
          name: r.name,
          description: getRoleDescription(r.name),
          permissions: getRolePermissions(r.name),
          users: r.users,
          created_at: null,
          updated_at: null
        }))
    ];

    return jsonResponse(200, { roles: enrichedRoles });
  });
}

export async function POST(req: NextRequest) {
  return handleApi(req, async () => {
    const { conn, session } = await requireAdmin(req);
    const body = await req.json();
    const rawName = String(body.name || "").trim();
    const name = rawName.toUpperCase();
    const description = String(body.description || "").trim();
    const permissions = normalizePermissions(body.permissions);
    const ts = nowTs();

    if (!name) throw new ApiError(400, "VALIDATION_FAILED", "Role name is required");
    if (permissions.length === 0) throw new ApiError(400, "VALIDATION_FAILED", "At least one permission is required");

    try {
      await conn
        .prepare("INSERT INTO roles (name, description, permissions_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)")
        .run(name, description, JSON.stringify(permissions), ts, ts);
    } catch {
      throw new ApiError(409, "CONFLICT", "Role already exists");
    }

    await auditLog(conn, {
      action: "ROLE_CREATED",
      actorUserId: session.user_id,
      targetUserId: null,
      ip: getClientIp(req),
      metadata: { name, permissions }
    });

    return jsonResponse(201, {
      role: { id: name, name, description, permissions, users: 0, created_at: ts, updated_at: ts }
    });
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

const safeParsePermissions = (json: string) => {
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) {
      return parsed.map(String);
    }
  } catch {
    // ignore
  }
  return getRolePermissions("");
};

function getRoleDescription(role: string) {
  switch (role.toUpperCase()) {
    case ROLE_ADMIN:
      return "Full system access";
    case ROLE_USER:
      return "Standard user access";
    case ROLE_SUPER_ADMIN:
      return "Super admin access";
    default:
      return "Custom role";
  }
}

function getRolePermissions(role: string) {
  switch (role.toUpperCase()) {
    case ROLE_ADMIN:
      return ["all_access"];
    case ROLE_SUPER_ADMIN:
      return ["all_access"];
    case ROLE_USER:
      return ["read_self", "update_self"];
    default:
      return [];
  }
}
