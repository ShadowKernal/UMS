'use client';

import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupIcon from '@mui/icons-material/Group';
import BadgeIcon from '@mui/icons-material/Badge';
import MailIcon from '@mui/icons-material/Mail';
import HistoryIcon from '@mui/icons-material/History';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const DRAWER_WIDTH = 240;

const MENU_ITEMS = [
    { text: 'Dashboard', icon: <DashboardIcon />, href: '/dashboard' },
    { text: 'Users', icon: <PeopleIcon />, href: '/admin/users' },
    { text: 'Roles & Permissions', icon: <SecurityIcon />, href: '/admin/roles' },
    { text: 'Groups', icon: <GroupIcon />, href: '/admin/groups' },
    { text: 'Invites', icon: <MailIcon />, href: '/admin/invites' },
    { text: 'Security', icon: <BadgeIcon />, href: '/admin/security' },
    { text: 'Audit Logs', icon: <HistoryIcon />, href: '/admin/audit-logs' },
    { text: 'Settings', icon: <SettingsIcon />, href: '/admin/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
            }}
        >
            <Box sx={{ overflow: 'auto' }}>
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Placeholder for Logo */}
                    <Box sx={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'primary.main' }}>
                        UMS Admin
                    </Box>
                </Box>
                <Divider />
                <List>
                    {MENU_ITEMS.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                component={Link}
                                href={item.href}
                                selected={pathname === item.href}
                            >
                                <ListItemIcon>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
}
