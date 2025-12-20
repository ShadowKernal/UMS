import { getDb } from "@/lib/db";
import GroupsClient, { Group } from "./GroupsClient";

export const dynamic = 'force-dynamic';

export default async function GroupsPage() {
    const conn = getDb();

    // Server-side data fetching - much faster than client-side API calls
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

    const initialGroups: Group[] = groups.map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description || "",
        members: Number(g.members || 0),
        memberSample: memberSamples.get(g.id) || []
    }));

    return <GroupsClient initialGroups={initialGroups} />;
}
