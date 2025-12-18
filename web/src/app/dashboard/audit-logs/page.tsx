import { getDb } from "@/lib/db";
import AuditLogsClient, { AuditLog } from "./AuditLogsClient";

export const dynamic = 'force-dynamic';

export default function AuditLogsPage() {
    const conn = getDb();

    // Server-side data fetching - much faster than client-side API calls
    const rows = conn
        .prepare(
            `
            SELECT a.id, a.action, a.actor_user_id, a.target_user_id, a.ip, a.created_at, a.metadata_json,
                   au.email as actor_email, tu.email as target_email
            FROM audit_logs a
            LEFT JOIN users au ON au.id = a.actor_user_id
            LEFT JOIN users tu ON tu.id = a.target_user_id
            ORDER BY a.created_at DESC
            LIMIT 50
            `
        )
        .all() as Array<{
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

    const initialLogs: AuditLog[] = rows.map((r) => ({
        id: r.id,
        action: r.action,
        actorEmail: r.actor_email || "system",
        targetEmail: r.target_email || "",
        ip: r.ip || "-",
        createdAt: r.created_at,
    }));

    return <AuditLogsClient initialLogs={initialLogs} />;
}
