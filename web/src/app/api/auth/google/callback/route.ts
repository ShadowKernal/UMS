import { NextRequest, NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/security";
import { getDb, newId, auditLog } from "@/lib/db";
import { USER_STATUS_ACTIVE, USER_STATUS_DELETED, USER_STATUS_DISABLED, ROLE_USER } from "@/lib/constants";
import { nowTs } from "@/lib/time";
import { createSession } from "@/lib/session";

type GoogleTokenInfo = {
  email?: string;
  email_verified?: boolean | string;
  name?: string;
};

const redirectWithError = (message: string) => NextResponse.redirect(`/login?error=${encodeURIComponent(message)}`);

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.nextUrl.origin}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return redirectWithError("google_not_configured");
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const storedState = req.cookies.get("google_oauth_state")?.value;
  const redirectAfter = req.cookies.get("google_oauth_redirect")?.value || "/admin";
  const clearCookies = (response: NextResponse) => {
    response.cookies.delete("google_oauth_state");
    response.cookies.delete("google_oauth_redirect");
    return response;
  };

  if (!code || !state || !storedState || state !== storedState) {
    return redirectWithError("google_state_mismatch");
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });

  if (!tokenRes.ok) {
    return redirectWithError("google_exchange_failed");
  }

  const tokenJson = (await tokenRes.json()) as { id_token?: string };
  const idToken = tokenJson.id_token;
  if (!idToken) {
    return redirectWithError("google_no_id_token");
  }

  // Validate token and pull user info
  const infoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!infoRes.ok) {
    return redirectWithError("google_token_invalid");
  }
  const info = (await infoRes.json()) as GoogleTokenInfo;
  const email = String(info.email || "").trim();
  const emailVerified = info.email_verified === true || info.email_verified === "true";
  const displayName = String(info.name || "").trim() || email.split("@")[0] || "User";

  if (!email || !emailVerified) {
    return redirectWithError("google_email_unverified");
  }

  const emailNorm = normalizeEmail(email);
  const conn = getDb();
  const ts = nowTs();

  interface UserRow {
    id: string;
    status: string;
    email_verified_at: number | null;
    display_name: string;
  }

  let userId: string;
  const existing = (await conn.prepare("SELECT * FROM users WHERE email_norm = ?").get(emailNorm)) as UserRow | undefined;

  if (existing) {
    if (existing.status === USER_STATUS_DISABLED) return redirectWithError("account_disabled");
    if (existing.status === USER_STATUS_DELETED) return redirectWithError("account_not_found");
    userId = existing.id;
    await conn
      .prepare("UPDATE users SET email_verified_at = COALESCE(email_verified_at, ?), display_name = COALESCE(display_name, ?), last_login_at = ?, updated_at = ? WHERE id = ?")
      .run(ts, displayName, ts, ts, userId);
  } else {
    userId = newId();
    const insertUser = conn.prepare(
      "INSERT INTO users (id, email, email_norm, email_verified_at, password_hash, status, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?)"
    );
    await insertUser.run(userId, email, emailNorm, ts, USER_STATUS_ACTIVE, displayName, ts, ts);
    await conn
      .prepare("INSERT INTO user_roles (user_id, role_name, assigned_by_user_id, assigned_at) VALUES (?, ?, NULL, ?)")
      .run(userId, ROLE_USER, ts);
  }

  const session = await createSession({ userId, remember: true, req });
  const res = NextResponse.redirect(redirectAfter || "/admin");
  session.cookies.forEach((cookie) => res.cookies.set(cookie.name, cookie.value, cookie.options));
  clearCookies(res);
  await auditLog(conn, { action: existing ? "LOGIN_SUCCESS_GOOGLE" : "SIGNUP_GOOGLE", actorUserId: userId, targetUserId: userId, ip: req.ip });

  return res;
}
