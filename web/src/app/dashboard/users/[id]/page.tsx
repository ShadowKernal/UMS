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
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import LinearProgress from '@mui/material/LinearProgress';
import LockResetIcon from '@mui/icons-material/LockReset';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import HistoryIcon from '@mui/icons-material/History';
import DevicesIcon from '@mui/icons-material/Devices';
import GroupIcon from '@mui/icons-material/Group';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ComputerIcon from '@mui/icons-material/Computer';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import LogoutIcon from '@mui/icons-material/Logout';
import ShieldIcon from '@mui/icons-material/Shield';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { motion, AnimatePresence } from 'framer-motion';

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

type AuditLogEntry = {
  id: string;
  action: string;
  createdAt: number;
  ip: string;
};

const MotionPaper = motion.create(Paper);

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = React.useState<UserDetail | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [tabValue, setTabValue] = React.useState(0);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [newDisplayName, setNewDisplayName] = React.useState('');
  const [roleDialogOpen, setRoleDialogOpen] = React.useState(false);
  const [activityLogs, setActivityLogs] = React.useState<AuditLogEntry[]>([]);
  const [loadingActivity, setLoadingActivity] = React.useState(false);

  const loadUser = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${params.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Unable to load user');
      setUser(data.user);
      setNewDisplayName(data.user.display_name || '');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load user');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const loadActivity = React.useCallback(async () => {
    if (!params.id) return;
    setLoadingActivity(true);
    try {
      const res = await fetch(`/api/admin/audit-logs?userId=${params.id}&limit=20`);
      const data = await res.json();
      if (res.ok) {
        setActivityLogs(data.logs || []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingActivity(false);
    }
  }, [params.id]);

  React.useEffect(() => {
    loadUser();
    loadActivity();
  }, [loadUser, loadActivity]);

  const statusConfig = (status: string) => {
    const val = status.toUpperCase();
    if (val === 'ACTIVE') return { color: 'success' as const, icon: <CheckCircleIcon />, label: 'Active' };
    if (val === 'PENDING') return { color: 'warning' as const, icon: <ScheduleIcon />, label: 'Pending' };
    if (val === 'DISABLED') return { color: 'error' as const, icon: <CancelIcon />, label: 'Disabled' };
    if (val === 'DELETED') return { color: 'error' as const, icon: <DeleteIcon />, label: 'Deleted' };
    return { color: 'info' as const, icon: <PersonIcon />, label: status };
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
      await loadActivity();
      setInfo(`User ${nextStatus === 'ACTIVE' ? 'enabled' : 'disabled'} successfully.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const updateDisplayName = async () => {
    if (!user) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: newDisplayName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Failed to update');
      setEditDialogOpen(false);
      await loadUser();
      setInfo('Display name updated successfully.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const revokeSession = async (sessionId: string) => {
    if (!user) return;
    if (!confirm('Revoke this session? The user will be logged out of that device.')) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error?.message || 'Failed to revoke session');
      }
      await loadUser();
      setInfo('Session revoked.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to revoke session');
    }
  };

  const deleteUser = async () => {
    if (!user) return;
    if (!confirm(`Delete ${user.email}? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Failed to delete user');
      router.push('/dashboard/users');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return <DevicesIcon />;
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <PhoneAndroidIcon />;
    }
    return <ComputerIcon />;
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getActionColor = (action: string): 'success' | 'error' | 'info' | 'warning' => {
    const a = action.toLowerCase();
    if (a.includes('fail')) return 'error';
    if (a.includes('delete') || a.includes('revoke')) return 'error';
    if (a.includes('success') || a.includes('accept') || a.includes('verify')) return 'success';
    if (a.includes('update') || a.includes('change')) return 'info';
    return 'warning';
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>Loading user...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="error" gutterBottom>{error || 'User not found'}</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/dashboard/users')}>
          Back to Users
        </Button>
      </Box>
    );
  }

  const statusInfo = statusConfig(user.status);

  return (
    <Box>
      {/* Header with breadcrumb */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/dashboard/users')}
          sx={{ mb: 2, color: 'text.secondary' }}
        >
          Back to Users
        </Button>
      </Box>

      {/* User Profile Header Card */}
      <MotionPaper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 200,
          height: 200,
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)'
        }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                fontWeight: 600,
                boxShadow: 3
              }}
            >
              {(user.display_name || user.email)[0].toUpperCase()}
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4" fontWeight={600}>{user.display_name || 'Unnamed User'}</Typography>
                <Tooltip title="Edit display name">
                  <IconButton size="small" onClick={() => setEditDialogOpen(true)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <EmailIcon fontSize="small" /> {user.email}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  icon={statusInfo.icon}
                  label={statusInfo.label}
                  color={statusInfo.color}
                  size="small"
                />
                {user.roles.map((role) => (
                  <Chip
                    key={role}
                    icon={<ShieldIcon />}
                    label={role}
                    variant="outlined"
                    size="small"
                    color="primary"
                  />
                ))}
              </Stack>
            </Box>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" startIcon={<LockResetIcon />} onClick={resetPassword} size="small">
              Reset Password
            </Button>
            <Button
              variant="outlined"
              color={user.status === 'DISABLED' ? 'success' : 'warning'}
              startIcon={user.status === 'DISABLED' ? <CheckCircleIcon /> : <BlockIcon />}
              onClick={toggleDisable}
              size="small"
            >
              {user.status === 'DISABLED' ? 'Enable' : 'Disable'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={deleteUser}
              size="small"
            >
              Delete
            </Button>
          </Stack>
        </Box>
      </MotionPaper>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>
          </motion.div>
        )}
        {info && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setInfo(null)}>{info}</Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabbed Content */}
      <Paper sx={{ borderRadius: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab icon={<DevicesIcon />} label="Sessions" iconPosition="start" />
          <Tab icon={<SecurityIcon />} label="Security" iconPosition="start" />
          <Tab icon={<GroupIcon />} label="Groups & Roles" iconPosition="start" />
          <Tab icon={<HistoryIcon />} label="Activity" iconPosition="start" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Sessions Tab */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DevicesIcon /> Active Sessions
              <Chip label={user.sessions.length} size="small" sx={{ ml: 1 }} />
            </Typography>
            {user.sessions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <DevicesIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                <Typography>No active sessions</Typography>
              </Box>
            ) : (
              <List>
                {user.sessions.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <ListItem sx={{ bgcolor: 'action.hover', borderRadius: 2, mb: 1 }}>
                      <ListItemIcon>{getDeviceIcon(s.user_agent)}</ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography fontWeight={500}>
                              {s.user_agent?.split(' ')[0] || 'Unknown Device'}
                            </Typography>
                            <Chip label={formatTimeAgo(s.last_seen_at)} size="small" variant="outlined" />
                          </Box>
                        }
                        secondary={
                          <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              IP: {s.ip || 'Unknown'} • Created: {new Date(s.created_at * 1000).toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                              {s.user_agent || 'Unknown user agent'}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Revoke session">
                          <IconButton edge="end" color="error" onClick={() => revokeSession(s.id)}>
                            <LogoutIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            )}
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VerifiedUserIcon /> Account Security
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CalendarTodayIcon /></ListItemIcon>
                      <ListItemText
                        primary="Account Created"
                        secondary={new Date(user.created_at * 1000).toLocaleString()}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><AccessTimeIcon /></ListItemIcon>
                      <ListItemText
                        primary="Last Updated"
                        secondary={new Date(user.updated_at * 1000).toLocaleString()}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><PersonIcon /></ListItemIcon>
                      <ListItemText
                        primary="Last Login"
                        secondary={user.last_login_at ? new Date(user.last_login_at * 1000).toLocaleString() : 'Never'}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShieldIcon /> Two-Factor Authentication
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Chip label="Not Enabled" color="warning" variant="outlined" sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      2FA is not yet configured for this account.
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Groups & Roles Tab */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SecurityIcon /> Roles
                    </Typography>
                    <Button startIcon={<AddIcon />} size="small" onClick={() => setRoleDialogOpen(true)}>
                      Manage
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {user.roles.length === 0 ? (
                    <Typography color="text.secondary">No roles assigned</Typography>
                  ) : (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {user.roles.map((r) => (
                        <Chip key={r} icon={<ShieldIcon />} label={r} color="primary" />
                      ))}
                    </Stack>
                  )}
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GroupIcon /> Groups
                    </Typography>
                    <Button startIcon={<AddIcon />} size="small">
                      Add to Group
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {user.groups.length === 0 ? (
                    <Typography color="text.secondary">Not a member of any groups</Typography>
                  ) : (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {user.groups.map((g) => (
                        <Chip key={g.id} icon={<GroupIcon />} label={g.name} variant="outlined" />
                      ))}
                    </Stack>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Activity Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon /> Recent Activity
            </Typography>
            {loadingActivity ? (
              <LinearProgress />
            ) : activityLogs.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <HistoryIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                <Typography>No activity recorded</Typography>
              </Box>
            ) : (
              <List>
                {activityLogs.map((log, i) => (
                  <motion.div key={log.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                    <ListItem sx={{ borderLeft: 3, borderColor: `${getActionColor(log.action)}.main`, bgcolor: 'action.hover', borderRadius: 1, mb: 1 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label={log.action} size="small" color={getActionColor(log.action)} variant="outlined" />
                            <Typography variant="caption" color="text.secondary">
                              {formatTimeAgo(log.createdAt)}
                            </Typography>
                          </Box>
                        }
                        secondary={`IP: ${log.ip} • ${new Date(log.createdAt * 1000).toLocaleString()}`}
                      />
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            )}
          </TabPanel>
        </Box>
      </Paper>

      {/* Edit Display Name Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Display Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Display Name"
            fullWidth
            value={newDisplayName}
            onChange={(e) => setNewDisplayName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={updateDisplayName} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Manage Roles Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Roles</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Select roles to assign to this user:
          </Typography>
          <Stack spacing={1}>
            {['USER', 'ADMIN', 'SUPER_ADMIN'].map((role) => (
              <Chip
                key={role}
                label={role}
                variant={user.roles.includes(role) ? 'filled' : 'outlined'}
                color={user.roles.includes(role) ? 'primary' : 'default'}
                onClick={() => {
                  // Role toggle logic would go here
                }}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
