'use client';

import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import dynamic from 'next/dynamic';
import AnalyticsCard from '@/components/dashboard/AnalyticsCard';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import BlockIcon from '@mui/icons-material/Block';
import LoginIcon from '@mui/icons-material/Login';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import { motion } from 'framer-motion';

// Lazy load heavy components
const UserGrowthChart = dynamic(() => import('@/components/dashboard/UserGrowthChart'), {
    ssr: false,
    loading: () => <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Skeleton variant="rectangular" width="100%" height={280} sx={{ borderRadius: 2 }} /></Box>
});
const RoleDistributionChart = dynamic(() => import('@/components/dashboard/RoleDistributionChart'), {
    ssr: false,
    loading: () => <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Skeleton variant="circular" width={180} height={180} /></Box>
});
const LoginActivityChart = dynamic(() => import('@/components/dashboard/LoginActivityChart'), {
    ssr: false,
    loading: () => <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Skeleton variant="rectangular" width="100%" height={280} sx={{ borderRadius: 2 }} /></Box>
});
const Gauge = dynamic(() => import('@mui/x-charts/Gauge').then(mod => mod.Gauge), {
    ssr: false,
    loading: () => <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Skeleton variant="circular" width={150} height={150} /></Box>
});

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

type AnalyticsData = {
    summary: {
        totalUsers: number;
        activeNow: number;
        newThisMonth: number;
        pendingInvites: number;
        securityScore: number;
    };
    roleDistribution: Array<{ label: string; value: number }>;
    userGrowth: Array<{ day: string; signups: number; active: number }>;
    loginActivity: Array<{ day: string; success: number; failed: number }>;
    recentActivity: Array<{
        id: string;
        action: string;
        createdAt: number;
        actorEmail: string;
        targetEmail: string;
    }>;
};

const getActivityIcon = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes('login')) return <LoginIcon />;
    if (a.includes('invite') || a.includes('signup') || a.includes('create')) return <PersonAddIcon />;
    if (a.includes('password') || a.includes('reset')) return <VpnKeyIcon />;
    if (a.includes('disable') || a.includes('block') || a.includes('delete')) return <BlockIcon />;
    if (a.includes('security') || a.includes('mfa')) return <SecurityIcon />;
    return <PersonIcon />;
};

const getActivityColor = (action: string): 'success' | 'error' | 'warning' | 'info' | 'primary' => {
    const a = action.toLowerCase();
    if (a.includes('fail') || a.includes('delete') || a.includes('revoke')) return 'error';
    if (a.includes('success') || a.includes('create') || a.includes('verify')) return 'success';
    if (a.includes('update') || a.includes('change')) return 'info';
    if (a.includes('pending') || a.includes('invite')) return 'warning';
    return 'primary';
};

const formatTimeAgo = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

export default function DashboardPage() {
    const [data, setData] = React.useState<AnalyticsData | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const loadAnalytics = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/analytics');
            const json = await res.json();
            if (!res.ok) throw new Error(json?.error?.message || 'Failed to load analytics');
            setData(json);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    const summary = data?.summary || {
        totalUsers: 0,
        activeNow: 0,
        newThisMonth: 0,
        pendingInvites: 0,
        securityScore: 0
    };

    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={600} gutterBottom>
                        Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Overview of your organization&apos;s activity and health.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={loadAnalytics}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                    <Button variant="outlined" startIcon={<DownloadIcon />}>
                        Export Report
                    </Button>
                </Box>
            </Box>

            {/* KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                        <AnalyticsCard
                            title="Total Users"
                            value={loading ? '—' : summary.totalUsers.toLocaleString()}
                            subtitle={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TrendingUpIcon fontSize="small" color="success" />
                                    <Typography variant="caption" color="success.main">
                                        +{summary.newThisMonth} this month
                                    </Typography>
                                </Box>
                            }
                            tooltip="Total registered users"
                        />
                    </motion.div>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                        <AnalyticsCard
                            title="Active Now"
                            value={loading ? '—' : summary.activeNow.toString()}
                            subtitle={
                                <Chip
                                    label="Live"
                                    size="small"
                                    color="success"
                                    sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
                                />
                            }
                            tooltip="Users with active sessions in last 24h"
                        />
                    </motion.div>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                        <AnalyticsCard
                            title="Security Score"
                            value={loading ? '—' : `${summary.securityScore}%`}
                            subtitle={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {summary.securityScore >= 70 ? (
                                        <TrendingUpIcon fontSize="small" color="success" />
                                    ) : (
                                        <TrendingDownIcon fontSize="small" color="warning" />
                                    )}
                                    <Typography variant="caption" color={summary.securityScore >= 70 ? 'success.main' : 'warning.main'}>
                                        {summary.securityScore >= 70 ? 'Good' : 'Needs attention'}
                                    </Typography>
                                </Box>
                            }
                            tooltip="Overall security health score"
                        />
                    </motion.div>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                        <AnalyticsCard
                            title="Pending Invites"
                            value={loading ? '—' : summary.pendingInvites.toString()}
                            subtitle={
                                summary.pendingInvites > 0 ? (
                                    <Typography variant="caption" color="warning.main">
                                        Awaiting acceptance
                                    </Typography>
                                ) : (
                                    <Typography variant="caption" color="text.secondary">
                                        All invites accepted
                                    </Typography>
                                )
                            }
                            tooltip="Invites sent but not accepted"
                        />
                    </motion.div>
                </Grid>
            </Grid>

            {/* Main Charts Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                        <AnalyticsCard title="User Activity" subtitle="Active users and new signups over the last 7 days">
                            <UserGrowthChart data={data?.userGrowth} />
                        </AnalyticsCard>
                    </motion.div>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                        <AnalyticsCard title="Role Distribution" subtitle="Users by role">
                            <RoleDistributionChart data={data?.roleDistribution} />
                        </AnalyticsCard>
                    </motion.div>
                </Grid>
            </Grid>

            {/* Bottom Row */}
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                        <AnalyticsCard title="Login Activity" subtitle="Authentication attempts over the last 7 days">
                            <LoginActivityChart data={data?.loginActivity} />
                        </AnalyticsCard>
                    </motion.div>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                        <AnalyticsCard title="Security Health" subtitle="Overall Score">
                            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Gauge
                                    value={summary.securityScore}
                                    startAngle={-110}
                                    endAngle={110}
                                    sx={{
                                        '& .MuiGauge-valueText': {
                                            fontSize: 36,
                                            fontWeight: 600,
                                        },
                                    }}
                                    text={({ value }) => `${value}%`}
                                />
                            </Box>
                            <Typography variant="body2" align="center" color="text.secondary">
                                {summary.securityScore >= 80 ? 'Excellent security posture' :
                                    summary.securityScore >= 60 ? 'Good standing. Enable MFA to improve.' :
                                        'Consider enabling additional security features'}
                            </Typography>
                        </AnalyticsCard>
                    </motion.div>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                        <AnalyticsCard title="Recent Activity" subtitle="Latest system events">
                            {loading ? (
                                <Box>
                                    {[1, 2, 3].map(i => (
                                        <Skeleton key={i} variant="rectangular" height={50} sx={{ mb: 1, borderRadius: 1 }} />
                                    ))}
                                </Box>
                            ) : (
                                <List dense sx={{ maxHeight: 280, overflow: 'auto' }}>
                                    {(data?.recentActivity || []).slice(0, 5).map((activity) => (
                                        <ListItem key={activity.id} sx={{ px: 0 }}>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: `${getActivityColor(activity.action)}.light`, width: 36, height: 36 }}>
                                                    {getActivityIcon(activity.action)}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body2" noWrap sx={{ maxWidth: 140 }}>
                                                        {activity.action.replace(/_/g, ' ')}
                                                    </Typography>
                                                }
                                                secondary={formatTimeAgo(activity.createdAt)}
                                            />
                                        </ListItem>
                                    ))}
                                    {(data?.recentActivity || []).length === 0 && (
                                        <ListItem>
                                            <ListItemText primary="No recent activity" secondary="Activity will appear here" />
                                        </ListItem>
                                    )}
                                </List>
                            )}
                        </AnalyticsCard>
                    </motion.div>
                </Grid>
            </Grid>
        </Box>
    );
}
