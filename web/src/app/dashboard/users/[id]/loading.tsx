import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Paper from '@mui/material/Paper';

export default function UserDetailLoading() {
    return (
        <Box>
            {/* Header Skeleton */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Skeleton variant="circular" width={64} height={64} sx={{ mr: 2 }} />
                    <Box>
                        <Skeleton variant="text" width={200} height={36} />
                        <Skeleton variant="text" width={180} height={22} />
                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 12 }} />
                            <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 12 }} />
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Skeleton variant="rectangular" width={140} height={36} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" width={90} height={36} sx={{ borderRadius: 1 }} />
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    {/* Sessions */}
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                            <Skeleton variant="text" width={160} height={28} />
                        </Box>
                        <Skeleton variant="rectangular" width="100%" height={1} sx={{ mb: 2 }} />
                        {[1, 2, 3].map(i => (
                            <Box key={i} sx={{ py: 1 }}>
                                <Skeleton variant="text" width="60%" height={20} />
                                <Skeleton variant="text" width="80%" height={16} />
                            </Box>
                        ))}
                    </Paper>

                    {/* Groups */}
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                            <Skeleton variant="text" width={80} height={28} />
                        </Box>
                        <Skeleton variant="rectangular" width="100%" height={1} sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} variant="rectangular" width={80} height={32} sx={{ borderRadius: 16 }} />
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    {/* Roles */}
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                            <Skeleton variant="text" width={60} height={28} />
                        </Box>
                        <Skeleton variant="rectangular" width="100%" height={1} sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Skeleton variant="rectangular" width={60} height={32} sx={{ borderRadius: 16 }} />
                            <Skeleton variant="rectangular" width={50} height={32} sx={{ borderRadius: 16 }} />
                        </Box>
                    </Paper>

                    {/* Metadata */}
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                            <Skeleton variant="text" width={90} height={28} />
                        </Box>
                        <Skeleton variant="rectangular" width="100%" height={1} sx={{ mb: 2 }} />
                        {[1, 2, 3].map(i => (
                            <Box key={i} sx={{ py: 1 }}>
                                <Skeleton variant="text" width="40%" height={18} />
                                <Skeleton variant="text" width="70%" height={16} />
                            </Box>
                        ))}
                    </Paper>

                    {/* Delete Button */}
                    <Box sx={{ mt: 3 }}>
                        <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
