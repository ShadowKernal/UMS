'use client';

import * as React from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Link from 'next/link';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';

export type UserRow = {
    id: string;
    display_name: string;
    email: string;
    status: string;
    roles: string[];
    created_at?: number;
    updated_at?: number;
};

interface UsersClientProps {
    initialRows: UserRow[];
}

export default function UsersClient({ initialRows }: UsersClientProps) {
    const [rows, setRows] = React.useState<UserRow[]>(initialRows);
    const [loading, setLoading] = React.useState(false); // Initial load is done by server
    const [openInvite, setOpenInvite] = React.useState(false);
    const [inviteEmail, setInviteEmail] = React.useState('');
    const [inviteRole, setInviteRole] = React.useState('USER');
    const [inviteName, setInviteName] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);

    // Refresh function if needed (e.g. after adding user)
    const fetchUsers = () => {
        setLoading(true);
        setError(null);
        fetch('/api/admin/users')
            .then(res => res.json())
            .then(data => {
                setRows((data.users || []) as UserRow[]);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch users', err);
                setError('Failed to fetch users');
                setLoading(false);
            });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setRows((prev) => prev.filter((r) => r.id !== id));
            } else {
                alert('Failed to delete user');
            }
        } catch (err) {
            console.error('Failed to delete user', err);
            alert('Error deleting user');
        }
    };

    const handleInvite = async () => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole, displayName: inviteName })
            });
            if (res.ok) {
                setOpenInvite(false);
                setInviteEmail('');
                setInviteName('');
                setInviteRole('USER');
                fetchUsers();
                alert('User invited successfully');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to invite user');
            }
        } catch (err) {
            console.error('Failed to invite user', err);
            alert('Error inviting user');
        }
    };

    const columns: GridColDef[] = [
        { field: 'display_name', headerName: 'Name', flex: 1, minWidth: 150 },
        { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params: GridRenderCellParams) => {
                let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
                const val = String(params.value || '').toLowerCase();
                if (val === 'active') color = 'success';
                if (val === 'disabled') color = 'error';
                if (val === 'pending') color = 'warning';
                return <Chip label={val || 'unknown'} color={color} size="small" variant="outlined" sx={{ textTransform: 'uppercase' }} />;
            }
        },
        {
            field: 'roles',
            headerName: 'Roles',
            width: 200,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {Array.isArray(params.value) && params.value.map((role: string) => (
                        <Chip key={role} label={role} size="small" />
                    ))}
                </Box>
            )
        },
        { field: 'created_at', headerName: 'Joined', width: 180, valueFormatter: (value: number) => new Date(value).toLocaleDateString() },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Box>
                    <IconButton component={Link} href={`/admin/users/${params.id}`} size="small" color="primary">
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(params.id as string)}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ height: 600, width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Users</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenInvite(true)}>
                    Invite User
                </Button>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                    },
                }}
                pageSizeOptions={[5, 10, 25]}
                checkboxSelection
                disableRowSelectionOnClick
                sx={{
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    border: 0,
                    '& .MuiDataGrid-cell:hover': {
                        color: 'primary.main',
                    },
                }}
            />

            <Dialog open={openInvite} onClose={() => setOpenInvite(false)}>
                <DialogTitle>Invite User</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Display Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={inviteRole}
                            label="Role"
                            onChange={(e) => setInviteRole(e.target.value)}
                        >
                            <MenuItem value="USER">User</MenuItem>
                            <MenuItem value="ADMIN">Admin</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenInvite(false)}>Cancel</Button>
                    <Button onClick={handleInvite} variant="contained">Invite</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
