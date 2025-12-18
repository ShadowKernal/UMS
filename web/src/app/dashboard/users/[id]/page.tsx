'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import LockResetIcon from '@mui/icons-material/LockReset';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import HistoryIcon from '@mui/icons-material/History';
import DevicesIcon from '@mui/icons-material/Devices';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

type Session = { id: string; last_seen_at: number; ip: string | null; user_agent: string | null; created_at: number; expires_at: number };
type Group = { id: string; name: string };
type UserDetail = {
  id: string;
  email: string;
  display_name: string;
  status: string;
  created_at: number;
  updated_at: number;
  last_login_at: number | null;
  roles: string[];
  groups: Group[];
  sessions: Session[];
};

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = React.useState<UserDetail | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const loadUser = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${params.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Unable to load user');
      setUser(data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load user');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  React.useEffect(() => {
    loadUser();
  }, [loadUser]);

  const statusColor = (status: string): 'success' | 'warning' | 'error' | 'info' => {
    const val = status.toUpperCase();
    if (val === 'ACTIVE') return 'success';
    if (val === 'PENDING') return 'warning';
    if (val === 'DISABLED' || val === 'DELETED') return 'error';
    return 'info';
  };

  const resetPassword = async () => {
    if (!user) return;
    setInfo(null);
    setError(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: user.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Failed to send reset');
      setInfo('Password reset email queued (check dev outbox).');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset');
    }
  };

  const toggleDisable = async () => {
    if (!user) return;
    setError(null);
    try {
      const nextStatus = user.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED';
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Failed to update status');
      await loadUser();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const deleteUser = async () => {
    if (!user) return;
    if (!confirm(`Delete ${user.email}? This revokes sessions and removes access.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Failed to delete user');
      router.push('/admin/users');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  if (loading) {
    return <Box>Loading...</Box>;
  }

  if (!user) {
    return <Box>{error || 'User not found'}</Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ width: 64, height: 64, mr: 2, bgcolor: 'primary.main' }}>{(user.display_name || user.email)[0]}</Avatar>
          <Box>
            <Typography variant="h4">{user.display_name || user.email}</Typography>
            <Typography variant="body1" color="text.secondary">{user.email}</Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={user.status} color={statusColor(user.status)} size="small" />
              {user.roles.map((role) => (
                <Chip key={role} label={role} variant="outlined" size="small" />
              ))}
            </Box>
          </Box>
        </Box>
        <Box>
          <Button variant="outlined" startIcon={<LockResetIcon />} sx={{ mr: 1 }} onClick={resetPassword}>
            Reset Password
          </Button>
          <Button variant="outlined" color="warning" startIcon={<BlockIcon />} onClick={toggleDisable}>
            {user.status === 'DISABLED' ? 'Enable' : 'Disable'}
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {info && <Alert severity="success" sx={{ mb: 2 }}>{info}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HistoryIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="h6">Recent Sessions</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List dense>
              {user.sessions.length === 0 && <ListItem><ListItemText primary="No active sessions" /></ListItem>}
              {user.sessions.map((s) => (
                <ListItem key={s.id}>
                  <ListItemText
                    primary={s.user_agent || 'Unknown device'}
                    secondary={`Last seen ${new Date(s.last_seen_at * 1000).toLocaleString()} • IP ${s.ip || 'unknown'}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HistoryIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="h6">Groups</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {user.groups.length === 0 && <Typography variant="body2" color="text.secondary">No groups</Typography>}
              {user.groups.map((g) => (
                <Chip key={g.id} label={g.name} />
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="h6">Roles</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {user.roles.length === 0 && <Typography variant="body2">No roles</Typography>}
              {user.roles.map((r) => (
                <Chip key={r} label={r} />
              ))}
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DevicesIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="h6">Metadata</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List dense>
              <ListItem>
                <ListItemText primary="Created" secondary={new Date(user.created_at * 1000).toLocaleString()} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Updated" secondary={new Date(user.updated_at * 1000).toLocaleString()} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Last login" secondary={user.last_login_at ? new Date(user.last_login_at * 1000).toLocaleString() : 'Never'} />
              </ListItem>
            </List>
          </Paper>

          <Box sx={{ mt: 3 }}>
            <Button variant="outlined" color="error" fullWidth startIcon={<DeleteIcon />} onClick={deleteUser}>
              Delete User
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
