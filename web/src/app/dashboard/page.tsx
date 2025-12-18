'use client';

import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import dynamic from 'next/dynamic';
import AnalyticsCard from '@/components/dashboard/AnalyticsCard';

// Lazy load heavy components
const UserGrowthChart = dynamic(() => import('@/components/dashboard/UserGrowthChart'), {
    ssr: false,
    loading: () => <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Chart...</Box>
});
const RoleDistributionChart = dynamic(() => import('@/components/dashboard/RoleDistributionChart'), {
    ssr: false,
    loading: () => <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Chart...</Box>
});
const LoginActivityChart = dynamic(() => import('@/components/dashboard/LoginActivityChart'), {
    ssr: false,
    loading: () => <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Chart...</Box>
});
const Gauge = dynamic(() => import('@mui/x-charts/Gauge').then(mod => mod.Gauge), {
    ssr: false,
    loading: () => <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</Box>
});
const gaugeClasses = { valueText: 'mui-gauge-valueText' }; // Fallback or import if needed, but let's see
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import BlockIcon from '@mui/icons-material/Block';

import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" gutterBottom>
                        Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Overview of your organization&apos;s activity and health.
                    </Typography>
                </Box>
                <Button variant="outlined" startIcon={<DownloadIcon />}>
                    Export Report
                </Button>
            </Box>

            {/* KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                        <AnalyticsCard title="Total Users" value="1,234" subtitle="+12% from last month" tooltip="Total registered users" />
                    </motion.div>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                        <AnalyticsCard title="Active Now" value="42" subtitle="Users logged in" tooltip="Users with active sessions" />
                    </motion.div>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                        <AnalyticsCard title="MFA Adoption" value="87%" subtitle="+5% from last month" tooltip="Percentage of users with MFA enabled" />
                    </motion.div>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                        <AnalyticsCard title="Pending Invites" value="8" subtitle="Expires in 24h" tooltip="Invites sent but not accepted" />
                    </motion.div>
                </Grid>
            </Grid>

            {/* Main Charts Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                        <AnalyticsCard title="User Growth" subtitle="New signups vs Active users">
                            <UserGrowthChart />
                        </AnalyticsCard>
                    </motion.div>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                        <AnalyticsCard title="Role Distribution" subtitle="Users by role">
                            <RoleDistributionChart />
                        </AnalyticsCard>
                    </motion.div>
                </Grid>
            </Grid>

            {/* Bottom Row */}
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                        <AnalyticsCard title="Login Activity" subtitle="Successful vs Failed logins">
                            <LoginActivityChart />
                        </AnalyticsCard>
                    </motion.div>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                        <AnalyticsCard title="Security Health" subtitle="Overall Score">
                            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Gauge
                                    value={75}
                                    startAngle={-110}
                                    endAngle={110}
                                    sx={{
                                        [`& .${gaugeClasses.valueText}`]: {
                                            fontSize: 40,
                                            transform: 'translate(0px, 0px)',
                                        },
                                    }}
                                    text={({ value }) => `${value}%`}
                                />
                            </Box>
                            <Typography variant="body2" align="center" color="text.secondary">
                                Good standing. Enable SSO to improve.
                            </Typography>
                        </AnalyticsCard>
                    </motion.div>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                        <AnalyticsCard title="Recent Activity" subtitle="Latest system events">
                            <List dense>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'success.light' }}>
                                            <PersonAddIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary="New User Joined" secondary="2 mins ago" />
                                </ListItem>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'error.light' }}>
                                            <BlockIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary="User Suspended" secondary="1 hour ago" />
                                </ListItem>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'warning.light' }}>
                                            <VpnKeyIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary="Password Reset" secondary="3 hours ago" />
                                </ListItem>
                            </List>
                        </AnalyticsCard>
                    </motion.div>
                </Grid>
            </Grid>
        </Box>
    );
}
