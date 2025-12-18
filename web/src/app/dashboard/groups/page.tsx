'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Paper from '@mui/material/Paper';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Divider from '@mui/material/Divider';
import DeleteIcon from '@mui/icons-material/Delete';

type Group = {
    id: string;
    name: string;
    description: string;
    members: number;
    memberSample: Array<{ user_id: string; display_name: string; email: string }>;
};

type UserOption = { id: string; label: string };

export default function GroupsPage() {
    const [groups, setGroups] = React.useState<Group[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [createOpen, setCreateOpen] = React.useState(false);
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [saving, setSaving] = React.useState(false);

    const [manageOpen, setManageOpen] = React.useState(false);
    const [activeGroup, setActiveGroup] = React.useState<Group | null>(null);
    const [members, setMembers] = React.useState<Array<{ id: string; display_name: string; email: string }>>([]);
    const [allUsers, setAllUsers] = React.useState<UserOption[]>([]);
    const [selectedUserId, setSelectedUserId] = React.useState('');

    const loadGroups = React.useCallback(() => {
        setLoading(true);
        setError(null);
        fetch('/api/admin/groups')
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error?.message || 'Failed to load groups');
                setGroups(data.groups || []);
            })
            .catch((err: unknown) => {
                console.error(err);
                setError(err instanceof Error ? err.message : 'Failed to load groups');
            })
            .finally(() => setLoading(false));
    }, []);

    const loadUsers = React.useCallback(async () => {
        if (allUsers.length > 0) return;
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (res.ok) {
                const userList = (data.users || []) as Array<{ id: string; display_name?: string; email: string }>;
                setAllUsers(userList.map((u) => ({ id: u.id, label: `${u.display_name || u.email} (${u.email})` })));
            }
        } catch (err) {
            console.error('Failed to load users', err);
        }
    }, [allUsers.length]);

    React.useEffect(() => {
        loadGroups();
    }, [loadGroups]);

    const createGroup = async () => {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error?.message || 'Failed to create group');
            setCreateOpen(false);
            setName('');
            setDescription('');
            loadGroups();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to create group');
        } finally {
            setSaving(false);
        }
    };

    const openManageMembers = async (group: Group) => {
        setActiveGroup(group);
        setManageOpen(true);
        setMembers([]);
        setSelectedUserId('');
        await loadUsers();
        try {
            const res = await fetch(`/api/admin/groups/${group.id}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error?.message || 'Failed to load members');
            setMembers(data.group?.members || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load members');
        }
    };

    const addMember = async () => {
        if (!activeGroup || !selectedUserId) return;
        try {
            const res = await fetch(`/api/admin/groups/${activeGroup.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'add-member', userId: selectedUserId })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error?.message || 'Failed to add member');
            setSelectedUserId('');
            openManageMembers(activeGroup);
            loadGroups();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to add member');
        }
    };

    const removeMember = async (userId: string) => {
        if (!activeGroup) return;
        try {
            const res = await fetch(`/api/admin/groups/${activeGroup.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'remove-member', userId })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error?.message || 'Failed to remove member');
            setMembers((prev) => prev.filter((m) => m.id !== userId));
            loadGroups();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to remove member');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4">Groups & Teams</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
                    Create Group
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
                {loading ? (
                    /* @ts-expect-error Grid types mismatch */
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, textAlign: 'center' }}>Loading groups...</Paper>
                    </Grid>
                ) : groups.length === 0 ? (
                    /* @ts-expect-error Grid types mismatch */
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, textAlign: 'center' }}>No groups yet.</Paper>
                    </Grid>
                ) : groups.map((group) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={group.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                                            <GroupIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6">{group.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {group.members} members
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton size="small">
                                        <MoreVertIcon />
                                    </IconButton>
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                                    {group.description || 'No description'}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: 12 } }}>
                                        {group.memberSample.map((m) => (
                                            <Avatar key={m.user_id}>{m.display_name?.[0] || m.email[0]}</Avatar>
                                        ))}
                                        {group.memberSample.length === 0 && <Avatar><GroupIcon fontSize="small" /></Avatar>}
                                    </AvatarGroup>
                                </Box>
                            </CardContent>
                            <CardActions>
                                <Button size="small" onClick={() => openManageMembers(group)}>Manage Members</Button>
                                <Button size="small" onClick={() => openManageMembers(group)}>Settings</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Create group</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <TextField
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            minRows={2}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
                    <Button onClick={createGroup} disabled={saving} variant="contained">
                        {saving ? 'Creating...' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={manageOpen} onClose={() => setManageOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Manage {activeGroup?.name}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            select
                            label="Add member"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            helperText="Select a user to add to this group"
                        >
                            <MenuItem value="">Select user</MenuItem>
                            {allUsers.map((u) => (
                                <MenuItem key={u.id} value={u.id}>{u.label}</MenuItem>
                            ))}
                        </TextField>
                        <Button variant="outlined" onClick={addMember} disabled={!selectedUserId}>
                            Add
                        </Button>
                        <Divider />
                        <Typography variant="subtitle1">Members</Typography>
                        <List dense>
                            {members.length === 0 && <ListItem><ListItemText primary="No members yet." /></ListItem>}
                            {members.map((m) => (
                                <ListItem key={m.id}>
                                    <ListItemText primary={m.display_name || m.email} secondary={m.email} />
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" aria-label="remove" onClick={() => removeMember(m.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setManageOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
