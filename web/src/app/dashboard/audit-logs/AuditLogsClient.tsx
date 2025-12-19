'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import ClearIcon from '@mui/icons-material/Clear';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { motion } from 'framer-motion';

export type AuditLog = {
    id: string;
    action: string;
    actorEmail: string;
    targetEmail: string;
    ip: string;
    createdAt: number;
};

const ACTION_CATEGORIES = [
    { value: '', label: 'All Actions' },
    { value: 'LOGIN', label: 'Login Events' },
    { value: 'USER', label: 'User Management' },
    { value: 'PASSWORD', label: 'Password Events' },
    { value: 'SESSION', label: 'Session Events' },
    { value: 'INVITE', label: 'Invitations' },
    { value: 'GROUP', label: 'Groups' },
    { value: 'ROLE', label: 'Roles' },
    { value: 'SETTINGS', label: 'Settings' },
];

const TIME_RANGES = [
    { value: '', label: 'All Time' },
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
];

const getActionColor = (action: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const lower = action.toLowerCase();
    if (lower.includes('fail')) return 'error';
    if (lower.includes('success') || lower.includes('verify')) return 'success';
    if (lower.includes('create') || lower.includes('invite')) return 'primary';
    if (lower.includes('update') || lower.includes('change')) return 'info';
    if (lower.includes('delete') || lower.includes('revoke')) return 'error';
    if (lower.includes('pending')) return 'warning';
    return 'default';
};

const columns: GridColDef[] = [
    {
        field: 'createdAt',
        headerName: 'Timestamp',
        width: 180,
        valueFormatter: (params: { value?: unknown }) => new Date(params.value as number * 1000).toLocaleString()
    },
    {
        field: 'actorEmail',
        headerName: 'Actor',
        width: 200,
        renderCell: (params) => (
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {params.value || 'system'}
            </Typography>
        )
    },
    {
        field: 'action',
        headerName: 'Action',
        width: 220,
        renderCell: (params: { value?: unknown }) => {
            const value = String(params.value || '');
            return (
                <Chip
                    label={value.replace(/_/g, ' ')}
                    color={getActionColor(value)}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                />
            );
        }
    },
    {
        field: 'targetEmail',
        headerName: 'Target',
        width: 200,
        renderCell: (params) => (
            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: params.value ? 'text.primary' : 'text.disabled' }}>
                {params.value || '—'}
            </Typography>
        )
    },
    {
        field: 'ip',
        headerName: 'IP Address',
        width: 140,
        renderCell: (params) => (
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {params.value || '—'}
            </Typography>
        )
    },
];

interface AuditLogsClientProps {
    initialLogs: AuditLog[];
}

export default function AuditLogsClient({ initialLogs }: AuditLogsClientProps) {
    const [logs, setLogs] = React.useState<AuditLog[]>(initialLogs);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState('');
    const [actionFilter, setActionFilter] = React.useState('');
    const [timeRange, setTimeRange] = React.useState('');
    const [showFilters, setShowFilters] = React.useState(false);
    const [selectedRows, setSelectedRows] = React.useState<GridRowSelectionModel>({
        type: 'include',
        ids: new Set()
    });

    const loadLogs = React.useCallback((options?: { forceRefresh?: boolean }) => {
        const q = search.trim();
        if (!q && !actionFilter && !timeRange && !options?.forceRefresh) {
            setLogs(initialLogs);
            return;
        }

        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (actionFilter) params.set('q', actionFilter);

        fetch(`/api/admin/audit-logs?${params.toString()}`)
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error?.message || 'Failed to load audit logs');
                let filteredLogs = data.logs || [];

                // Client-side time filtering (since we don't have server-side support yet)
                if (timeRange) {
                    const now = Math.floor(Date.now() / 1000);
                    let cutoff = 0;
                    switch (timeRange) {
                        case '1h': cutoff = now - 3600; break;
                        case '24h': cutoff = now - 86400; break;
                        case '7d': cutoff = now - 604800; break;
                        case '30d': cutoff = now - 2592000; break;
                    }
                    if (cutoff > 0) {
                        filteredLogs = filteredLogs.filter((log: AuditLog) => log.createdAt >= cutoff);
                    }
                }

                setLogs(filteredLogs);
            })
            .catch((err: unknown) => {
                console.error(err);
                setError(err instanceof Error ? err.message : 'Failed to load audit logs');
            })
            .finally(() => setLoading(false));
    }, [search, actionFilter, timeRange, initialLogs]);

    React.useEffect(() => {
        const handle = setTimeout(() => loadLogs(), 300);
        return () => clearTimeout(handle);
    }, [search, actionFilter, timeRange, loadLogs]);

    const exportCsv = async () => {
        try {
            const res = await fetch('/api/admin/audit-logs?format=csv');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch {
            setError('Failed to export logs');
        }
    };

    const clearFilters = () => {
        setSearch('');
        setActionFilter('');
        setTimeRange('');
    };

    const hasActiveFilters = search || actionFilter || timeRange;

    return (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={600}>Audit Logs</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {logs.length.toLocaleString()} events {hasActiveFilters && '(filtered)'}
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Refresh">
                        <IconButton onClick={() => loadLogs({ forceRefresh: true })} disabled={loading}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportCsv}>
                        Export CSV
                    </Button>
                </Stack>
            </Box>

            {/* Search and Filter Bar */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                    <TextField
                        placeholder="Search logs..."
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="disabled" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ minWidth: 280 }}
                    />

                    <Button
                        variant={showFilters ? 'contained' : 'outlined'}
                        startIcon={<FilterListIcon />}
                        endIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        onClick={() => setShowFilters(!showFilters)}
                        size="small"
                    >
                        Filters {hasActiveFilters && <Chip label="Active" size="small" sx={{ ml: 1, height: 18 }} />}
                    </Button>

                    {hasActiveFilters && (
                        <Button
                            variant="text"
                            startIcon={<ClearIcon />}
                            onClick={clearFilters}
                            size="small"
                            color="inherit"
                        >
                            Clear
                        </Button>
                    )}
                </Stack>

                <Collapse in={showFilters}>
                    <Stack direction="row" spacing={2} sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }} flexWrap="wrap" useFlexGap>
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel>Action Type</InputLabel>
                            <Select
                                value={actionFilter}
                                onChange={(e) => setActionFilter(e.target.value)}
                                label="Action Type"
                            >
                                {ACTION_CATEGORIES.map((cat) => (
                                    <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel>Time Range</InputLabel>
                            <Select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                label="Time Range"
                            >
                                {TIME_RANGES.map((range) => (
                                    <MenuItem key={range.value} value={range.value}>{range.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <ButtonGroup size="small" variant="outlined">
                            <Button onClick={() => setTimeRange('1h')}>1H</Button>
                            <Button onClick={() => setTimeRange('24h')}>24H</Button>
                            <Button onClick={() => setTimeRange('7d')}>7D</Button>
                            <Button onClick={() => setTimeRange('30d')}>30D</Button>
                        </ButtonGroup>
                    </Stack>
                </Collapse>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <DataGrid
                    rows={logs}
                    columns={columns}
                    loading={loading}
                    getRowId={(row) => row.id}
                    checkboxSelection
                    rowSelectionModel={selectedRows}
                    onRowSelectionModelChange={setSelectedRows}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 25 },
                        },
                        sorting: {
                            sortModel: [{ field: 'createdAt', sort: 'desc' }],
                        },
                    }}
                    pageSizeOptions={[25, 50, 100]}
                    disableRowSelectionOnClick
                    sx={{
                        border: 0,
                        '& .MuiDataGrid-cell': {
                            borderColor: 'divider',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: 'action.hover',
                        },
                        '& .MuiDataGrid-row:hover': {
                            bgcolor: 'action.hover',
                        },
                    }}
                    autoHeight
                />
            </Paper>

            {selectedRows.ids.size > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                        {selectedRows.ids.size} log(s) selected
                    </Typography>
                    <Button size="small" variant="outlined" onClick={() => setSelectedRows({ type: 'include', ids: new Set() })}>
                        Clear Selection
                    </Button>
                </Box>
            )}
        </Box>
    );
}
