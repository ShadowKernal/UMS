import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Paper from '@mui/material/Paper';

export default function SecurityLoading() {
    return (
        <Box>
            {/* Header Skeleton */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Skeleton variant="text" width={220} height={40} />
                <Skeleton variant="rectangular" width={80} height={40} sx={{ borderRadius: 1 }} />
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    {/* MFA Section */}
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                            <Skeleton variant="text" width={280} height={28} />
                        </Box>
                        <Skeleton variant="rectangular" width="100%" height={1} sx={{ mb: 2 }} />
                        {[1, 2].map(i => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <Skeleton variant="rectangular" width={40} height={24} sx={{ mr: 2, borderRadius: 12 }} />
                                <Skeleton variant="text" width={200} height={24} />
                            </Box>
                        ))}
                        <Skeleton variant="text" width="100%" height={40} sx={{ mt: 1 }} />
                    </Paper>

                    {/* Password Policy */}
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                            <Skeleton variant="text" width={160} height={28} />
                        </Box>
                        <Skeleton variant="rectangular" width="100%" height={1} sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: 2 }}>
                            {[1, 2].map(i => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Skeleton variant="rectangular" width={40} height={24} sx={{ mr: 2, borderRadius: 12 }} />
                                    <Skeleton variant="text" width={180} height={24} />
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    {/* SSO Section */}
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                            <Skeleton variant="text" width={180} height={28} />
                        </Box>
                        <Skeleton variant="rectangular" width="100%" height={1} sx={{ mb: 2 }} />
                        <Skeleton variant="text" width="100%" height={40} sx={{ mb: 2 }} />
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} variant="rectangular" width="100%" height={42} sx={{ mb: 2, borderRadius: 1 }} />
                        ))}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
