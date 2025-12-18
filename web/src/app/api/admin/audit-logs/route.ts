import { NextRequest, NextResponse } from "next/server";
import { handleApi } from "@/lib/route-helpers";
import { ApiError } from "@/lib/errors";
import { assertAuthenticated } from "@/lib/session";
import { getDb, userRoles } from "@/lib/db";
import { ROLE_ADMIN, ROLE_SUPER_ADMIN } from "@/lib/constants";
import { jsonResponse } from "@/lib/http";

const requireAdmin = (req: NextRequest) => {
  const session = assertAuthenticated(req);
  const conn = getDb();
  const roles = userRoles(conn, session.user_id);
  if (!roles.includes(ROLE_ADMIN) && !roles.includes(ROLE_SUPER_ADMIN)) {
    throw new ApiError(403, "FORBIDDEN", "Admin role required");
  }
  return { conn };
};

export async function GET(req: NextRequest) {
  return handleApi(req, async () => {
    const { conn } = requireAdmin(req);
    const search = (req.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
    const format = (req.nextUrl.searchParams.get("format") || "").toLowerCase();
    const userId = (req.nextUrl.searchParams.get("userId") || "").trim();
    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1", 10) || 1);
    const limit = Math.max(1, Math.min(200, parseInt(req.nextUrl.searchParams.get("limit") || "50", 10) || 50));
    const offset = (page - 1) * limit;

    const params: unknown[] = [];
    const conditions: string[] = [];

    if (userId) {
      conditions.push("(a.actor_user_id = ? OR a.target_user_id = ?)");
      params.push(userId, userId);
    }

    if (search) {
      conditions.push("(LOWER(a.action) LIKE ? OR LOWER(au.email) LIKE ? OR LOWER(tu.email) LIKE ?)");
      const needle = `%${search}%`;
      params.push(needle, needle, needle);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = conn
      .prepare(
        `
        SELECT a.id, a.action, a.actor_user_id, a.target_user_id, a.ip, a.created_at, a.metadata_json,
               au.email as actor_email, tu.email as target_email
        FROM audit_logs a
        LEFT JOIN users au ON au.id = a.actor_user_id
        LEFT JOIN users tu ON tu.id = a.target_user_id
        ${where}
        ORDER BY a.created_at DESC
        LIMIT ? OFFSET ?
      `
      )
      .all(...params, limit, offset) as Array<{
        id: string;
        action: string;
        actor_user_id: string | null;
        target_user_id: string | null;
        ip: string | null;
        created_at: number;
        metadata_json: string | null;
        actor_email: string | null;
        target_email: string | null;
      }>;

    const logs = rows.map((r) => ({
      id: r.id,
      action: r.action,
      actorEmail: r.actor_email || "system",
      targetEmail: r.target_email || "",
      ip: r.ip || "-",
      createdAt: r.created_at,
      metadata: safeParse(r.metadata_json)
    }));

    if (format === "csv") {
      const header = "timestamp,action,actor,target,ip\n";
      const lines = logs
        .map((l) =>
          [new Date(l.createdAt * 1000).toISOString(), l.action, l.actorEmail, l.targetEmail, l.ip]
            .map((v) => `"${String(v).replace(/\"/g, '\"\"')}"`)
            .join(",")
        )
        .join("\n");
      return new NextResponse(header + lines, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=\"audit_logs.csv\""
        }
      });
    }

    return jsonResponse(200, { logs, page, limit });
  });
}

const safeParse = (json: string | null) => {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // ignore
  }
  return {};
};
