'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface DashboardLayoutProps {
    children: React.ReactNode;
    user?: {
        display_name: string;
        email: string;
    } | null;
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
    return (
        <Box sx={{ display: 'flex' }}>
            {/* Topbar needs user info */}
            <Topbar user={user} />
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
                <Toolbar /> {/* Spacer for fixed AppBar */}
                {children}
            </Box>
        </Box>
    );
}
