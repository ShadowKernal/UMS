import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.nextUrl.origin}/api/auth/google/callback`;
  const redirectAfter = req.nextUrl.searchParams.get("redirect") || "/admin";

  if (!clientId) {
    return NextResponse.redirect(`/login?error=${encodeURIComponent("google_not_configured")}`);
  }

  const state = crypto.randomBytes(16).toString("hex");
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("prompt", "select_account");
  authUrl.searchParams.set("state", state);

  const isSecure = process.env.NODE_ENV === "production";
  const res = NextResponse.redirect(authUrl.toString());
  res.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60
  });
  res.cookies.set("google_oauth_redirect", redirectAfter, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60
  });

  return res;
}
