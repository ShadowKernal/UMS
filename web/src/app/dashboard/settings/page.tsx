import { getDb } from "@/lib/db";
import SettingsClient, { SettingsState } from "./SettingsClient";

export const dynamic = 'force-dynamic';

const SETTINGS_KEY = "org_settings";

const DEFAULT_SETTINGS: SettingsState = {
    organizationName: 'Acme Corp',
    supportEmail: 'support@acme.com',
    technicalContact: 'tech@acme.com',
    integrations: { slackConnected: false, githubConnected: false },
    compliance: { auditLogging: true, enforceSso: false, logRetentionDays: 365 },
};

export default function SettingsPage() {
    const conn = getDb();

    // Server-side data fetching - much faster than client-side API calls
    const row = conn.prepare("SELECT value_json FROM settings WHERE key = ?").get(SETTINGS_KEY) as { value_json: string } | undefined;

    let initialSettings = DEFAULT_SETTINGS;
    if (row) {
        try {
            const parsed = JSON.parse(row.value_json);
            initialSettings = {
                ...DEFAULT_SETTINGS,
                ...parsed,
                integrations: { ...DEFAULT_SETTINGS.integrations, ...(parsed.integrations || {}) },
                compliance: { ...DEFAULT_SETTINGS.compliance, ...(parsed.compliance || {}) },
            };
        } catch {
            // Use defaults on parse error
        }
    }

    return <SettingsClient initialSettings={initialSettings} />;
}
