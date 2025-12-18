'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import SecurityIcon from '@mui/icons-material/Security';
import LockIcon from '@mui/icons-material/Lock';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

type SecuritySettings = {
    requireMfaAdmins: boolean;
    requireMfaUsers: boolean;
    passwordMinLength: number;
    passwordExpiryDays: number;
    requireSpecialChars: boolean;
    preventPasswordReuse: boolean;
    sso: { google: boolean; okta: boolean; customSaml: boolean };
};

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
    const [security, setSecurity] = React.useState<SecuritySettings>(DEFAULT_SECURITY);
    const [error, setError] = React.useState<string | null>(null);
    const [saved, setSaved] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/admin/settings');
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error?.message || 'Failed to load settings');
                setSecurity({ ...DEFAULT_SECURITY, ...(data.settings?.security || {}) });
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const updateField = (path: string, value: boolean | number) => {
        setSecurity((prev) => {
            const [first, second] = path.split('.');
            if (second) {
                return {
                    ...prev,
                    [first]: { ...(prev as Record<string, unknown>)[first] as Record<string, unknown>, [second]: value },
                } as SecuritySettings;
            }
            return { ...prev, [first]: value } as SecuritySettings;
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
                body: JSON.stringify({ security })
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Security Settings</Typography>
                <Button variant="contained" onClick={save} disabled={saving || loading}>
                    {saving ? 'Saving...' : 'Save'}
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {saved && <Alert severity="success" sx={{ mb: 2 }}>Security settings saved</Alert>}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6">Multi-Factor Authentication (MFA)</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <FormControlLabel
                            control={<Switch checked={security.requireMfaAdmins} onChange={(e) => updateField('requireMfaAdmins', e.target.checked)} />}
                            label="Require MFA for all Admins"
                            sx={{ display: 'block', mb: 1 }}
                        />
                        <FormControlLabel
                            control={<Switch checked={security.requireMfaUsers} onChange={(e) => updateField('requireMfaUsers', e.target.checked)} />}
                            label="Require MFA for all Users"
                            sx={{ display: 'block', mb: 2 }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Enforcing MFA will require users to set up a second factor (Authenticator App, SMS, etc.) upon their next login.
                        </Typography>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <LockIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6">Password Policy</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Min Length"
                                    type="number"
                                    value={security.passwordMinLength}
                                    onChange={(e) => updateField('passwordMinLength', Number(e.target.value))}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Expiration (days)"
                                    type="number"
                                    value={security.passwordExpiryDays}
                                    onChange={(e) => updateField('passwordExpiryDays', Number(e.target.value))}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: 2 }}>
                            <FormControlLabel
                                control={<Switch checked={security.requireSpecialChars} onChange={(e) => updateField('requireSpecialChars', e.target.checked)} />}
                                label="Require Special Characters"
                            />
                            <FormControlLabel
                                control={<Switch checked={security.preventPasswordReuse} onChange={(e) => updateField('preventPasswordReuse', e.target.checked)} />}
                                label="Prevent Password Reuse"
                            />
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <VpnKeyIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6">Single Sign-On (SSO)</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Configure SAML or OIDC providers to allow users to sign in with your organization&apos;s identity provider.
                        </Typography>

                        <Stack spacing={2}>
                            <Button variant={security.sso.google ? 'contained' : 'outlined'} fullWidth onClick={() => updateField('sso.google', !security.sso.google)}>
                                {security.sso.google ? 'Google Workspace enabled' : 'Configure Google Workspace'}
                            </Button>
                            <Button variant={security.sso.okta ? 'contained' : 'outlined'} fullWidth onClick={() => updateField('sso.okta', !security.sso.okta)}>
                                {security.sso.okta ? 'Okta enabled' : 'Configure Okta'}
                            </Button>
                            <Button variant={security.sso.customSaml ? 'contained' : 'outlined'} fullWidth onClick={() => updateField('sso.customSaml', !security.sso.customSaml)}>
                                {security.sso.customSaml ? 'Custom SAML enabled' : 'Add Custom SAML Provider'}
                            </Button>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
