'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplayIcon from '@mui/icons-material/Replay';
import SendIcon from '@mui/icons-material/Send';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

type Invite = {
    id: string;
    email: string;
    displayName?: string;
    role: string;
    sentAt: number | null;
    expiresAt: number | null;
    status: string;
};

const statusColor = (status: string): 'default' | 'success' | 'error' | 'warning' | 'info' => {
    switch (status.toUpperCase()) {
        case 'ACCEPTED': return 'success';
        case 'REVOKED': return 'error';
        case 'EXPIRED': return 'error';
        case 'SENT': return 'info';
        default: return 'warning';
    }
};

export default function InvitesPage() {
    const [invites, setInvites] = React.useState<Invite[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [role, setRole] = React.useState('USER');
    const [displayName, setDisplayName] = React.useState('');
    const [saving, setSaving] = React.useState(false);

    const loadInvites = React.useCallback(() => {
        setLoading(true);
        setError(null);
        fetch('/api/admin/invites')
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error?.message || 'Failed to load invites');
                setInvites(data.invites || []);
            })
            .catch((err: unknown) => {
                console.error(err);
                setError(err instanceof Error ? err.message : 'Failed to load invites');
            })
            .finally(() => setLoading(false));
    }, []);

    React.useEffect(() => {
        loadInvites();
    }, [loadInvites]);

    const sendInvite = async () => {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/invites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role, displayName })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error?.message || 'Failed to send invite');
            setDialogOpen(false);
            setEmail('');
            setDisplayName('');
            setRole('USER');
            loadInvites();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to send invite');
        } finally {
            setSaving(false);
        }
    };

    const resendInvite = async (invite: Invite) => {
        setError(null);
        try {
            const res = await fetch('/api/admin/invites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: invite.id })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error?.message || 'Failed to resend invite');
            loadInvites();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to resend invite');
        }
    };

    const revokeInvite = async (invite: Invite) => {
        if (!confirm(`Revoke invite for ${invite.email}?`)) return;
        setError(null);
        try {
            const res = await fetch(`/api/admin/users/${invite.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error?.message || 'Failed to revoke invite');
            loadInvites();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to revoke invite');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4">Invites & Onboarding</Typography>
                <Button variant="contained" startIcon={<SendIcon />} onClick={() => setDialogOpen(true)}>
                    Send Invite
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="invites table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Sent At</TableCell>
                            <TableCell>Expires At</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">Loading...</TableCell>
                            </TableRow>
                        ) : invites.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No invites yet.</TableCell>
                            </TableRow>
                        ) : invites.map((invite) => (
                            <TableRow
                                key={invite.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {invite.email}
                                </TableCell>
                                <TableCell>{invite.role}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={invite.status}
                                        color={statusColor(invite.status)}
                                        size="small"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>{invite.sentAt ? new Date(invite.sentAt * 1000).toLocaleString() : '—'}</TableCell>
                                <TableCell>{invite.expiresAt ? new Date(invite.expiresAt * 1000).toLocaleDateString() : '—'}</TableCell>
                                <TableCell align="right">
                                    {invite.status.toUpperCase() !== 'ACCEPTED' && invite.status.toUpperCase() !== 'REVOKED' && (
                                        <>
                                            <IconButton color="primary" size="small" title="Resend" onClick={() => resendInvite(invite)}>
                                                <ReplayIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton color="error" size="small" title="Revoke" onClick={() => revokeInvite(invite)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Send invite</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            required
                        />
                        <TextField
                            label="Display name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Optional"
                        />
                        <TextField select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
                            <MenuItem value="USER">User</MenuItem>
                            <MenuItem value="ADMIN">Admin</MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={sendInvite} disabled={saving} variant="contained">
                        {saving ? 'Sending...' : 'Send'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
