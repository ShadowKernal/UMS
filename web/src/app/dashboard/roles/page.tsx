import { getDb } from "@/lib/db";
import RolesClient, { Role } from "./RolesClient";

export const dynamic = 'force-dynamic';

export default async function RolesPage() {
    const conn = getDb();

    interface RoleRow {
        name: string;
        description: string;
        permissions: string;
    }

    // Fetch roles and their associated user counts directly
    const roles = (await conn.prepare("SELECT name, description, permissions_json as permissions FROM roles ORDER BY name ASC").all()) as RoleRow[];

    // Get counts
    const counts = (await conn.prepare("SELECT role_name, COUNT(*) as count FROM user_roles GROUP BY role_name").all()) as { role_name: string; count: number }[];
    const countMap = new Map(counts.map(c => [c.role_name, Number(c.count || 0)]));

    const initialRoles: Role[] = roles.map((r) => ({
        id: r.name, // Use name as ID for the frontend key
        name: r.name,
        description: r.description,
        permissions: JSON.parse(r.permissions || "[]"),
        users: countMap.get(r.name) || 0
    }));

    return <RolesClient initialRoles={initialRoles} />;
}
