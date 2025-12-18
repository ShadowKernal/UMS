import { getDb } from "@/lib/db";
import UsersClient, { UserRow } from "./UsersClient";

export const dynamic = 'force-dynamic';

export default function UsersPage() {
    const conn = getDb();

    // Fetch users (Server-side directly from DB)
    // This avoids the internal API latency and HTTP roundtrip
    const users = conn
        .prepare("SELECT id, email, status, display_name, created_at, updated_at FROM users ORDER BY created_at DESC")
        .all() as UserRow[];

    const allUserIds = users.map(u => u.id);
    const allRolesMap = new Map<string, string[]>();

    if (allUserIds.length > 0) {
        const rolesQuery = conn
            .prepare(`SELECT user_id, role_name as role FROM user_roles WHERE user_id IN (${allUserIds.map(() => '?').join(',')})`)
            .all(...allUserIds) as Array<{ user_id: string; role: string }>;

        rolesQuery.forEach(row => {
            if (!allRolesMap.has(row.user_id)) {
                allRolesMap.set(row.user_id, []);
            }
            allRolesMap.get(row.user_id)!.push(row.role);
        });
    }

    const initialRows: UserRow[] = users.map((u) => ({
        ...u,
        roles: allRolesMap.get(u.id) || []
    }));

    return <UsersClient initialRows={initialRows} />;
}
