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
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';

export type Role = {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    users: number;
};

interface RolesClientProps {
    initialRoles: Role[];
}

export default function RolesClient({ initialRoles }: RolesClientProps) {
    const [roles, setRoles] = React.useState<Role[]>(initialRoles);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<Role | null>(null);
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [permissions, setPermissions] = React.useState('');
    const [saving, setSaving] = React.useState(false);

    const loadRoles = React.useCallback(() => {
        setLoading(true);
        setError(null);
        fetch('/api/admin/roles')
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error?.message || 'Failed to load roles');
                setRoles(data.roles || []);
            })
            .catch((err: unknown) => {
                console.error('Failed to fetch roles', err);
                setError(err instanceof Error ? err.message : 'Failed to load roles');
            })
            .finally(() => setLoading(false));
    }, []);

    const openCreate = () => {
        setEditing(null);
        setName('');
        setDescription('');
        setPermissions('read_self, update_self');
        setDialogOpen(true);
    };

    const openEdit = (role: Role) => {
        setEditing(role);
        setName(role.name);
        setDescription(role.description);
        setPermissions(role.permissions.join(', '));
        setDialogOpen(true);
    };

    const saveRole = async () => {
        setSaving(true);
        setError(null);
        const payload = {
            name,
            description,
            permissions: permissions.split(',').map((p) => p.trim()).filter(Boolean)
        };

        try {
            const res = await fetch(editing ? `/api/admin/roles/${encodeURIComponent(editing.name)}` : '/api/admin/roles', {
                method: editing ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error?.message || 'Unable to save role');
            setDialogOpen(false);
            loadRoles();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unable to save role');
        } finally {
            setSaving(false);
        }
    };

    const deleteRole = async (role: Role) => {
        if (!confirm(`Delete role ${role.name}? Users assigned to it will lose this role.`)) return;
        setError(null);
        try {
            const res = await fetch(`/api/admin/roles/${encodeURIComponent(role.name)}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error?.message || 'Failed to delete role');
            loadRoles();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to delete role');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4">Roles & Permissions</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
                    Create Role
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="roles table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Role Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Users</TableCell>
                            <TableCell>Permissions</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">Loading...</TableCell>
                            </TableRow>
                        ) : roles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No roles yet.</TableCell>
                            </TableRow>
                        ) : roles.map((role) => (
                            <TableRow
                                key={role.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                    {role.name}
                                </TableCell>
                                <TableCell>{role.description || '—'}</TableCell>
                                <TableCell>{role.users}</TableCell>
                                <TableCell>
                                    {role.permissions.map((perm) => (
                                        <Chip key={perm} label={perm} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                                    ))}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" size="small" onClick={() => openEdit(role)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton color="error" size="small" onClick={() => deleteRole(role)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{editing ? 'Edit role' : 'Create role'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Role name"
                            value={name}
                            onChange={(e) => setName(e.target.value.toUpperCase())}
                            disabled={!!editing}
                            placeholder="e.g. SUPPORT_LEAD"
                            required
                        />
                        <TextField
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is this role allowed to do?"
                            multiline
                            minRows={2}
                        />
                        <TextField
                            label="Permissions (comma separated)"
                            value={permissions}
                            onChange={(e) => setPermissions(e.target.value)}
                            helperText="Example: manage_users, view_audit_logs"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={saveRole} disabled={saving} variant="contained">
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
