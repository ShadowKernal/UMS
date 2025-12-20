import { NextRequest } from "next/server";
import { handleApi } from "@/lib/route-helpers";
import { ApiError } from "@/lib/errors";
import { auditLog, getDb, userRoles } from "@/lib/db";
import { ROLE_ADMIN, ROLE_SUPER_ADMIN } from "@/lib/constants";
import { assertAuthenticated } from "@/lib/session";
import { jsonResponse, getClientIp } from "@/lib/http";
import { nowTs } from "@/lib/time";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string; sessionId: string } }
) {
    return handleApi(req, async () => {
        const { conn, session } = await requireAdmin(req);
        const userId = params.id;
        const sessionId = params.sessionId;

        if (!userId || !sessionId) {
            throw new ApiError(400, "INVALID_REQUEST", "User ID and Session ID required");
        }

        // Verify session belongs to user
        const targetSession = (await conn
            .prepare("SELECT id FROM sessions WHERE id = ? AND user_id = ?")
            .get(sessionId, userId)) as { id: string } | undefined;

        if (!targetSession) {
            throw new ApiError(404, "NOT_FOUND", "Session not found");
        }

        const ts = nowTs();
        await conn
            .prepare("UPDATE sessions SET revoked_at = ? WHERE id = ?")
            .run(ts, sessionId);

        await auditLog(conn, {
            action: "SESSION_REVOKED",
            actorUserId: session.user_id,
            targetUserId: userId,
            ip: getClientIp(req),
            metadata: { sessionId }
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
