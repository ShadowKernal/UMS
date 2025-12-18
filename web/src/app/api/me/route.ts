import { NextRequest } from "next/server";
import { handleApi } from "@/lib/route-helpers";
import { assertAuthenticated } from "@/lib/session";
import { jsonResponse } from "@/lib/http";

export async function GET(req: NextRequest) {
  return handleApi(req, async () => {
    const session = assertAuthenticated(req);
    return jsonResponse(200, {
      user: {
        id: session.user_id,
        email: session.email,
        status: session.status,
        roles: session.roles
      },
      csrfToken: session.csrf_token
    });
  });
}
