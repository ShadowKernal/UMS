import { NextRequest } from "next/server";
import { handleApi } from "@/lib/route-helpers";
import { ApiError } from "@/lib/errors";
import { assertAuthenticated } from "@/lib/session";
import { auditLog, getDb, newId, userRoles } from "@/lib/db";
import { ROLE_ADMIN, ROLE_SUPER_ADMIN } from "@/lib/constants";
import { jsonResponse, getClientIp } from "@/lib/http";
import { nowTs } from "@/lib/time";

const requireAdmin = async (req: NextRequest) => {
  const session = await assertAuthenticated(req);
  const conn = getDb();
  const roles = await userRoles(conn, session.user_id);
  if (!roles.includes(ROLE_ADMIN) && !roles.includes(ROLE_SUPER_ADMIN)) {
    throw new ApiError(403, "FORBIDDEN", "Admin role required");
  }
  return { conn, session };
};

export async function GET(req: NextRequest) {
  return handleApi(req, async () => {
    const { conn } = await requireAdmin(req);

    const groups = (await conn
      .prepare(
        `
        SELECT g.id, g.name, g.description, g.created_at, g.updated_at, COUNT(m.user_id) as members
        FROM groups g
        LEFT JOIN group_members m ON m.group_id = g.id
        GROUP BY g.id
        ORDER BY g.name ASC
        `
      )
      .all()) as Array<{ id: string; name: string; description: string | null; created_at: number; updated_at: number; members: number }>;

    const memberSamples = new Map<
      string,
      Array<{ user_id: string; display_name: string; email: string }>
    >();
    for (const g of groups) {
      const rows = (await conn
        .prepare(
          `
          SELECT u.id as user_id, u.display_name, u.email
          FROM group_members gm
          JOIN users u ON u.id = gm.user_id
          WHERE gm.group_id = ?
          ORDER BY gm.added_at DESC
          LIMIT 4
        `
        )
        .all(g.id)) as Array<{ user_id: string; display_name: string; email: string }>;
      memberSamples.set(g.id, rows);
    }

    return jsonResponse(200, {
      groups: groups.map((g) => ({
        ...g,
        description: g.description || "",
        members: Number(g.members || 0),
        memberSample: memberSamples.get(g.id) || []
      }))
    });
  });
}

export async function POST(req: NextRequest) {
  return handleApi(req, async () => {
    const { conn, session } = await requireAdmin(req);
    const body = await req.json();
    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const ts = nowTs();

    if (!name) throw new ApiError(400, "VALIDATION_FAILED", "Group name is required");

    const id = newId();
    try {
      await conn
        .prepare("INSERT INTO groups (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)")
        .run(id, name, description, ts, ts);
    } catch {
      throw new ApiError(409, "CONFLICT", "Group name already exists");
    }

    await auditLog(conn, {
      action: "GROUP_CREATED",
      actorUserId: session.user_id,
      targetUserId: null,
      ip: getClientIp(req),
      metadata: { id, name }
    });

    return jsonResponse(201, { group: { id, name, description, members: 0, created_at: ts, updated_at: ts } });
  });
}
