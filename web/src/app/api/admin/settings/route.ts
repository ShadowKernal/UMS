import { NextRequest } from "next/server";
import { handleApi } from "@/lib/route-helpers";
import { ApiError } from "@/lib/errors";
import { assertAuthenticated } from "@/lib/session";
import { auditLog, getDb, userRoles } from "@/lib/db";
import { ROLE_ADMIN, ROLE_SUPER_ADMIN } from "@/lib/constants";
import { jsonResponse, getClientIp } from "@/lib/http";
import { nowTs } from "@/lib/time";

const SETTINGS_KEY = "org_settings";

type Settings = {
  organizationName: string;
  supportEmail: string;
  technicalContact: string;
  integrations: { slackConnected: boolean; githubConnected: boolean };
  compliance: { auditLogging: boolean; enforceSso: boolean; logRetentionDays: number };
  security: {
    requireMfaAdmins: boolean;
    requireMfaUsers: boolean;
    passwordMinLength: number;
    passwordExpiryDays: number;
    requireSpecialChars: boolean;
    preventPasswordReuse: boolean;
    sso: { google: boolean; okta: boolean; customSaml: boolean };
  };
};

const defaultSettings: Settings = {
  organizationName: "Acme Corp",
  supportEmail: "support@acme.com",
  technicalContact: "tech@acme.com",
  integrations: { slackConnected: false, githubConnected: false },
  compliance: { auditLogging: true, enforceSso: false, logRetentionDays: 365 },
  security: {
    requireMfaAdmins: true,
    requireMfaUsers: false,
    passwordMinLength: 12,
    passwordExpiryDays: 90,
    requireSpecialChars: true,
    preventPasswordReuse: true,
    sso: { google: false, okta: false, customSaml: false }
  }
};

export async function GET(req: NextRequest) {
  return handleApi(req, async () => {
    const { conn } = await requireAdmin(req);
    return jsonResponse(200, { settings: await getSettings(conn) });
  });
}

export async function POST(req: NextRequest) {
  return handleApi(req, async () => {
    const { conn, session } = await requireAdmin(req);
    const body = await req.json();
    const merged = mergeSettings(await getSettings(conn), (body || {}) as Partial<Settings>);
    const ts = nowTs();

    await conn
      .prepare("INSERT INTO settings (key, value_json, updated_at) VALUES (?, ?, ?) ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json, updated_at = EXCLUDED.updated_at")
      .run(SETTINGS_KEY, JSON.stringify(merged), ts);

    await auditLog(conn, {
      action: "SETTINGS_UPDATED",
      actorUserId: session.user_id,
      targetUserId: null,
      ip: getClientIp(req)
    });

    return jsonResponse(200, { settings: merged });
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

const getSettings = async (conn: ReturnType<typeof getDb>): Promise<Settings> => {
  const row = (await conn.prepare("SELECT value_json FROM settings WHERE key = ?").get(SETTINGS_KEY)) as { value_json: string } | undefined;
  if (!row) return defaultSettings;
  try {
    const parsed = JSON.parse(row.value_json);
    return mergeSettings(defaultSettings, parsed);
  } catch {
    return defaultSettings;
  }
};

const mergeSettings = (base: Settings, incoming: Partial<Settings>): Settings => ({
  ...base,
  ...incoming,
  integrations: { ...base.integrations, ...(incoming.integrations || {}) },
  compliance: { ...base.compliance, ...(incoming.compliance || {}) },
  security: {
    ...base.security,
    ...(incoming.security || {}),
    sso: { ...base.security.sso, ...(incoming.security?.sso || {}) }
  }
});
