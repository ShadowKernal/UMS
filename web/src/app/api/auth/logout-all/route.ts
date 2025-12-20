import { NextRequest } from "next/server";
import { handleApi } from "@/lib/route-helpers";
import { assertAuthenticated, assertCsrf } from "@/lib/session";
import { getDb, auditLog } from "@/lib/db";
import { nowTs } from "@/lib/time";
import { jsonResponse } from "@/lib/http";
import { COOKIE_CSRF, COOKIE_SESSION } from "@/lib/constants";

export async function POST(req: NextRequest) {
  return handleApi(req, async () => {
    const session = await assertAuthenticated(req);
    assertCsrf(req, session);

    const conn = getDb();
    await conn.prepare("UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL").run(nowTs(), session.user_id);
    await auditLog(conn, { action: "LOGOUT_ALL", actorUserId: session.user_id, targetUserId: session.user_id, ip: req.ip });
    return jsonResponse(204, {}, { clearCookies: [COOKIE_SESSION, COOKIE_CSRF] });
  });
}
