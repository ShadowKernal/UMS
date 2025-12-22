import { NextRequest } from "next/server";
import { COOKIE_CSRF, COOKIE_SESSION, SESSION_MAX_AGE_SECONDS, SESSION_REMEMBER_AGE_SECONDS, USER_STATUS_DELETED, USER_STATUS_DISABLED } from "./constants";
import { ApiError } from "./errors";
import { dbEnabled, getDb, userRoles } from "./db";
import { nowTs } from "./time";
import { randomToken, sha256Hex } from "./security";
import { getClientIp } from "./http";
import crypto from "crypto";
import { cookies } from "next/headers";

export type ActiveSession = {
  id: string;
  user_id: string;
  csrf_token: string;
  email: string;
  status: string;
  roles: string[];
  expires_at: number;
};

export const getActiveSession = async (req: NextRequest): Promise<ActiveSession | null> => {
  if (!dbEnabled) return null;
  const cookie = req.cookies.get(COOKIE_SESSION)?.value;
  if (!cookie) return null;
  return await validateSessionToken(cookie);
};

// Extracted validation logic to reuse in Server Components
const validateSessionToken = async (tokenRaw: string): Promise<ActiveSession | null> => {
  if (!dbEnabled) return null;
  const conn = getDb();
  interface SessionRow {
    id: string;
    user_id: string;
    csrf_token: string;
    email: string;
    status: string;
    revoked_at: number | null;
    expires_at: number;
  }

  const row = (await conn
    .prepare("SELECT s.*, u.email, u.status FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?")
    .get(sha256Hex(tokenRaw))) as SessionRow | undefined;
  if (!row) return null;
  const ts = nowTs();
  if (row.revoked_at || row.expires_at <= ts) return null;

  // Side-effect: Update last_seen (might be better to skip for pure reads, but keeps accurate tracking)
  try {
    await conn.prepare("UPDATE sessions SET last_seen_at = ? WHERE id = ?").run(ts, row.id);
  } catch {
    // Ignore write errors in read-only contexts if any
  }

  return {
    id: row.id,
    user_id: row.user_id,
    csrf_token: row.csrf_token,
    email: row.email,
    status: row.status,
    roles: await userRoles(conn, row.user_id),
    expires_at: row.expires_at
  };
}

// Server Component Helper
export const getCurrentUser = async () => {
  if (!dbEnabled) return null;
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_SESSION)?.value;
  if (!token) return null;

  const session = await validateSessionToken(token);
  if (!session) return null;

  const conn = getDb();
  const user = (await conn.prepare("SELECT id, email, display_name, status FROM users WHERE id = ?").get(session.user_id)) as {
    id: string;
    email: string;
    display_name: string;
    status: string;
  } | undefined;

  return user || null;
};

export const getCurrentUserWithRoles = async () => {
  if (!dbEnabled) return null;
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_SESSION)?.value;
  if (!token) return null;

  const session = await validateSessionToken(token);
  if (!session) return null;

  const conn = getDb();
  const user = (await conn.prepare("SELECT id, email, display_name, status FROM users WHERE id = ?").get(session.user_id)) as {
    id: string;
    email: string;
    display_name: string;
    status: string;
  } | undefined;

  if (!user) return null;

  return {
    ...user,
    roles: session.roles
  };
};


export const assertAuthenticated = async (req: NextRequest): Promise<ActiveSession> => {
  const session = await getActiveSession(req);
  if (!session) throw new ApiError(401, "UNAUTHENTICATED", "Not authenticated");
  return session;
};

export const assertCsrf = (req: NextRequest, session: ActiveSession) => {
  const csrfCookie = req.cookies.get(COOKIE_CSRF)?.value || "";
  const csrfHeader = req.headers.get("x-csrf-token") || "";
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader || csrfCookie !== session.csrf_token) {
    throw new ApiError(403, "CSRF_INVALID", "CSRF token invalid");
  }
};

export const createSession = async (opts: {
  userId: string;
  remember: boolean;
  req: NextRequest;
}) => {
  if (!dbEnabled) {
    throw new ApiError(503, "DB_DISABLED", "Database disabled");
  }
  const { userId, remember, req } = opts;
  const conn = getDb();

  // Validate user before creating session
  const user = (await conn.prepare("SELECT status FROM users WHERE id = ?").get(userId)) as { status: string } | undefined;
  if (!user || user.status === USER_STATUS_DISABLED || user.status === USER_STATUS_DELETED) {
    throw new ApiError(403, "ACCOUNT_DISABLED", "Account disabled or invalid");
  }

  const ts = nowTs();
  const maxAge = remember ? SESSION_REMEMBER_AGE_SECONDS : SESSION_MAX_AGE_SECONDS;
  const expiresAt = ts + maxAge;
  const sessionId = cryptoUuid();
  const tokenRaw = randomToken(32);
  const csrfToken = randomToken(24);
  const isSecure = process.env.NODE_ENV === "production";

  await conn
    .prepare(
      "INSERT INTO sessions (id, token_hash, user_id, csrf_token, created_at, last_seen_at, expires_at, revoked_at, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)"
    )
    .run(sessionId, sha256Hex(tokenRaw), userId, csrfToken, ts, ts, expiresAt, getClientIp(req), req.headers.get("user-agent"));

  return {
    sessionId,
    expiresAt,
    cookies: [
      { name: COOKIE_SESSION, value: tokenRaw, options: { httpOnly: true, maxAge, path: "/", secure: isSecure, sameSite: "lax" as const } },
      { name: COOKIE_CSRF, value: csrfToken, options: { httpOnly: false, maxAge, path: "/", secure: isSecure, sameSite: "lax" as const } }
    ]
  };
};

const cryptoUuid = () => crypto.randomUUID();
