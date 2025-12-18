import { getDb } from "@/lib/db";
import SecurityClient, { SecuritySettings } from "./SecurityClient";

export const dynamic = 'force-dynamic';

const SETTINGS_KEY = "org_settings";

const DEFAULT_SECURITY: SecuritySettings = {
    requireMfaAdmins: true,
    requireMfaUsers: false,
    passwordMinLength: 12,
    passwordExpiryDays: 90,
    requireSpecialChars: true,
    preventPasswordReuse: true,
    sso: { google: false, okta: false, customSaml: false }
};

export default function SecurityPage() {
    const conn = getDb();

    // Server-side data fetching - much faster than client-side API calls
    const row = conn.prepare("SELECT value_json FROM settings WHERE key = ?").get(SETTINGS_KEY) as { value_json: string } | undefined;

    let initialSecurity = DEFAULT_SECURITY;
    if (row) {
        try {
            const parsed = JSON.parse(row.value_json);
            const security = parsed.security || {};
            initialSecurity = {
                ...DEFAULT_SECURITY,
                ...security,
                sso: { ...DEFAULT_SECURITY.sso, ...(security.sso || {}) }
            };
        } catch {
            // Use defaults on parse error
        }
    }

    return <SecurityClient initialSecurity={initialSecurity} />;
}
