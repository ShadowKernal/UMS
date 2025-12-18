import { getDb } from "@/lib/db";
import { ROLE_USER, USER_STATUS_PENDING, USER_STATUS_ACTIVE, USER_STATUS_DELETED } from "@/lib/constants";
import { nowTs } from "@/lib/time";
import InvitesClient, { Invite } from "./InvitesClient";

export const dynamic = 'force-dynamic';

export default function InvitesPage() {
    const conn = getDb();
    const ts = nowTs();

    // Server-side data fetching - much faster than client-side API calls
    interface InviteRow {
        id: string;
        email: string;
        display_name: string;
        status: string;
        created_at: number;
    }

    const rows = conn
        .prepare(
            "SELECT id, email, display_name, status, created_at FROM users WHERE status IN (?, ?, ?) ORDER BY created_at DESC LIMIT 200"
        )
        .all(USER_STATUS_PENDING, USER_STATUS_ACTIVE, USER_STATUS_DELETED) as InviteRow[];

    const initialInvites: Invite[] = rows.map((row) => {
        const token = conn
            .prepare(
                "SELECT created_at, expires_at, used_at FROM email_verification_tokens WHERE user_id = ? ORDER BY created_at DESC LIMIT 1"
            )
            .get(row.id) as { created_at: number; expires_at: number; used_at: number | null } | undefined;
        const roleRows = conn
            .prepare("SELECT role_name FROM user_roles WHERE user_id = ? ORDER BY role_name ASC")
            .all(row.id) as { role_name: string }[];

        let status = "SENT";
        if (row.status === USER_STATUS_DELETED) status = "REVOKED";
        else if (row.status === USER_STATUS_ACTIVE || token?.used_at) status = "ACCEPTED";
        else if (token && token.expires_at < ts) status = "EXPIRED";
        else if (row.status === USER_STATUS_PENDING) status = "PENDING";

        return {
            id: row.id,
            email: row.email,
            displayName: row.display_name,
            role: roleRows.map((r) => r.role_name)[0] || ROLE_USER,
            sentAt: token?.created_at || row.created_at,
            expiresAt: token?.expires_at || null,
            status
        };
    });

    return <InvitesClient initialInvites={initialInvites} />;
}
