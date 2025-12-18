'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import BusinessIcon from '@mui/icons-material/Business';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import SaveIcon from '@mui/icons-material/Save';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';

export type SettingsState = {
    organizationName: string;
    supportEmail: string;
    technicalContact: string;
    integrations: { slackConnected: boolean; githubConnected: boolean };
    compliance: { auditLogging: boolean; enforceSso: boolean; logRetentionDays: number };
};

interface SettingsClientProps {
    initialSettings: SettingsState;
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
    const [settings, setSettings] = React.useState<SettingsState>(initialSettings);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [saved, setSaved] = React.useState(false);

    const updateField = (path: string, value: string | boolean | number) => {
        setSettings((prev) => {
            const [first, second] = path.split('.');
            if (second) {
                return {
                    ...prev,
                    [first]: { ...(prev as Record<string, unknown>)[first] as Record<string, unknown>, [second]: value },
                } as SettingsState;
            }
            return { ...prev, [first]: value } as SettingsState;
        });
    };

    const save = async () => {
        setSaving(true);
        setSaved(false);
        setError(null);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error?.message || 'Failed to save settings');
            setSaved(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4">Organization Settings</Typography>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={save} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {saved && <Alert severity="success" sx={{ mb: 2 }}>Settings saved</Alert>}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6">General Information</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={2}>
                            <TextField
                                label="Organization Name"
                                value={settings.organizationName}
                                onChange={(e) => updateField('organizationName', e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label="Support Email"
                                value={settings.supportEmail}
                                onChange={(e) => updateField('supportEmail', e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label="Technical Contact"
                                value={settings.technicalContact}
                                onChange={(e) => updateField('technicalContact', e.target.value)}
                                fullWidth
                            />
                        </Stack>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <IntegrationInstructionsIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6">Integrations</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box>
                                <Typography variant="subtitle1">Slack</Typography>
                                <Typography variant="body2" color="text.secondary">Receive notifications in Slack</Typography>
                            </Box>
                            <Button variant="outlined" size="small" onClick={() => updateField('integrations.slackConnected', !settings.integrations.slackConnected)}>
                                {settings.integrations.slackConnected ? 'Disconnect' : 'Connect'}
                            </Button>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box>
                                <Typography variant="subtitle1">GitHub</Typography>
                                <Typography variant="body2" color="text.secondary">Sync teams and members</Typography>
                            </Box>
                            <Button variant="outlined" size="small" onClick={() => updateField('integrations.githubConnected', !settings.integrations.githubConnected)}>
                                {settings.integrations.githubConnected ? 'Disconnect' : 'Connect'}
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Compliance &amp; Data</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <FormControlLabel
                            control={<Switch checked={settings.compliance.auditLogging} onChange={(e) => updateField('compliance.auditLogging', e.target.checked)} />}
                            label="Enable Audit Logging"
                            sx={{ display: 'block', mb: 1 }}
                        />
                        <FormControlLabel
                            control={<Switch checked={settings.compliance.enforceSso} onChange={(e) => updateField('compliance.enforceSso', e.target.checked)} />}
                            label="Enforce SSO for all users"
                            sx={{ display: 'block', mb: 1 }}
                        />
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>Data Retention</Typography>
                            <TextField
                                label="Log Retention (Days)"
                                type="number"
                                value={settings.compliance.logRetentionDays}
                                onChange={(e) => updateField('compliance.logRetentionDays', Number(e.target.value))}
                                fullWidth
                                size="small"
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
