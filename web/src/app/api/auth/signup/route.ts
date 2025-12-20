import { NextRequest } from "next/server";
import { handleApi } from "@/lib/route-helpers";
import { ApiError } from "@/lib/errors";
import { isValidEmail, normalizeEmail, passwordHashSync, randomToken, sha256Hex } from "@/lib/security";
import { getClientIp } from "@/lib/http";
import { getDb, newId, sendDevEmail, auditLog } from "@/lib/db";
import { nowTs } from "@/lib/time";
import { ROLE_USER, USER_STATUS_PENDING, USER_STATUS_DELETED } from "@/lib/constants";
import { jsonResponse } from "@/lib/http";

const getBaseUrl = (req: NextRequest) => {
  return req.nextUrl.origin;
};

export async function POST(req: NextRequest) {
  return handleApi(req, async () => {
    const body = await req.json();
    const email = String(body?.email || "").trim();
    const password = String(body?.password || "");
    const profile = (body?.profile && typeof body.profile === "object" ? body.profile : {}) as Record<string, unknown>;
    const displayName = String(profile?.displayName || "").trim() || "User";

    if (!isValidEmail(email)) throw new ApiError(422, "VALIDATION_FAILED", "Invalid email");
    if (password.length < 8) throw new ApiError(422, "VALIDATION_FAILED", "Password must be at least 8 characters");

    const conn = getDb();
    const emailNorm = normalizeEmail(email);
    const ts = nowTs();
    interface UserRow {
      id: string;
      email_verified_at: number | null;
      status: string;
    }

    const signupTx = conn.transaction(async (tx) => {
      const existing = (await tx.prepare("SELECT * FROM users WHERE email_norm = ?").get(emailNorm)) as UserRow | undefined;

      let userId: string | null = null;
      let isNewUser = false;

      if (!existing) {
        isNewUser = true;
      } else if (existing.status === USER_STATUS_DELETED) {
        // Purge any deleted record and recreate fresh.
        await tx.prepare("DELETE FROM users WHERE id = ?").run(existing.id);
        isNewUser = true;
      } else {
        // Existing non-deleted account blocks signup.
        throw new ApiError(409, "CONFLICT", "User already exists");
      }

      if (isNewUser) {
        userId = newId();
        await tx
          .prepare(
            "INSERT INTO users (id, email, email_norm, email_verified_at, password_hash, status, display_name, created_at, updated_at) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?)"
          )
          .run(userId, email, emailNorm, passwordHashSync(password), USER_STATUS_PENDING, displayName, ts, ts);
        await tx
          .prepare("INSERT INTO user_roles (user_id, role_name, assigned_by_user_id, assigned_at) VALUES (?, ?, NULL, ?)")
          .run(userId, ROLE_USER, ts);
      }

      // Only send verification email if it's a new user to prevent enumeration/bombing
      if (isNewUser && userId) {
        const rawToken = randomToken(18);
        await tx
          .prepare(
            "INSERT INTO email_verification_tokens (id, user_id, token_hash, created_at, expires_at, used_at) VALUES (?, ?, ?, ?, ?, NULL)"
          )
          .run(newId(), userId, sha256Hex(rawToken), ts, ts + 24 * 3600);
        const verifyLink = `${getBaseUrl(req)}/verify-email?token=${encodeURIComponent(rawToken)}`;
        await sendDevEmail(tx, {
          toEmail: email,
          subject: "Verify your email",
          body: `Your verification code:\n\n${rawToken}\n\nOr open:\n${verifyLink}\n`
        });
        await auditLog(tx, { action: "EMAIL_VERIFICATION_SENT", actorUserId: null, targetUserId: userId, ip: getClientIp(req) });
      }

      return { status: USER_STATUS_PENDING };
    });

    const result = await signupTx();
    return jsonResponse(202, { status: result.status });

  });
}
