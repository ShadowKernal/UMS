'use client';

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const DRAWER_WIDTH = 240;

interface TopbarProps {
    user?: {
        display_name: string;
        email: string;
    } | null;
}

export default function Topbar({ user }: TopbarProps) {
    const router = useRouter();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleClose();
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh(); // Refresh to clear referencing data
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                width: `calc(100% - ${DRAWER_WIDTH}px)`,
                ml: `${DRAWER_WIDTH}px`,
                bgcolor: 'background.paper',
                color: 'text.primary',
                boxShadow: 'none',
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Toolbar>
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
                    {/* Page Title could go here dynamically */}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {user && (
                        <Typography variant="body2" sx={{ mr: 1, fontWeight: 500, color: 'text.secondary' }}>
                            Hi, {user.display_name}
                        </Typography>
                    )}

                    <IconButton size="large" aria-label="show new notifications" color="inherit">
                        <NotificationsIcon />
                    </IconButton>

                    <IconButton
                        size="large"
                        edge="end"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenu}
                        color="primary"
                    >
                        <AccountCircle />
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                                mt: 1.5,
                            }
                        }}
                    >
                        {user && (
                            <Box sx={{ px: 2, py: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    {user.display_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {user.email}
                                </Typography>
                            </Box>
                        )}
                        {user && <Divider />}
                        <MenuItem onClick={handleClose} component={Link} href="/admin/settings">
                            Settings
                        </MenuItem>
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                            Logout
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
