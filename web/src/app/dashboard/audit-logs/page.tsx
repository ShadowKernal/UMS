'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import Alert from '@mui/material/Alert';

type AuditLog = {
    id: string;
    action: string;
    actorEmail: string;
    targetEmail: string;
    ip: string;
    createdAt: number;
};

const columns: GridColDef[] = [
    {
        field: 'createdAt', headerName: 'Timestamp', width: 190,
        valueFormatter: (params: { value?: unknown }) => new Date(params.value as number * 1000).toLocaleString()
    },
    { field: 'actorEmail', headerName: 'Actor', width: 200 },
    {
        field: 'action', headerName: 'Action', width: 200,
        renderCell: (params: { value?: unknown }) => {
            const value = String(params.value || '');
            let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
            const lower = value.toLowerCase();
            if (lower.includes('fail')) color = 'error';
            if (lower.includes('success')) color = 'success';
            if (lower.includes('create')) color = 'primary';
            if (lower.includes('update')) color = 'info';
            return <Chip label={value} color={color} size="small" variant="outlined" />;
        }
    },
    { field: 'targetEmail', headerName: 'Target', width: 200 },
    { field: 'ip', headerName: 'IP Address', width: 150 },
];

export default function AuditLogsPage() {
    const [logs, setLogs] = React.useState<AuditLog[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState('');

    const loadLogs = React.useCallback((q: string) => {
        setLoading(true);
        setError(null);
        const qs = q ? `?q=${encodeURIComponent(q)}` : '';
        fetch(`/api/admin/audit-logs${qs}`)
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error?.message || 'Failed to load audit logs');
                setLogs(data.logs || []);
            })
            .catch((err: unknown) => {
                console.error(err);
                setError(err instanceof Error ? err.message : 'Failed to load audit logs');
            })
            .finally(() => setLoading(false));
    }, []);

    React.useEffect(() => {
        const handle = setTimeout(() => loadLogs(search), 300);
        return () => clearTimeout(handle);
    }, [search, loadLogs]);

    const exportCsv = async () => {
        try {
            const res = await fetch('/api/admin/audit-logs?format=csv');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'audit_logs.csv';
            link.click();
            window.URL.revokeObjectURL(url);
        } catch {
            setError('Failed to export logs');
        }
    };

    return (
        <Box sx={{ height: 600, width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Audit Logs</Typography>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportCsv}>
                    Export CSV
                </Button>
            </Box>

            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                    placeholder="Search logs..."
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: 320 }}
                />
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <DataGrid
                rows={logs}
                columns={columns}
                loading={loading}
                getRowId={(row) => row.id}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 25 },
                    },
                }}
                pageSizeOptions={[25, 50, 100]}
                disableRowSelectionOnClick
                sx={{
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    border: 0,
                }}
            />
        </Box>
    );
}
