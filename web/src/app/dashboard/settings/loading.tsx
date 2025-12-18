import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Paper from '@mui/material/Paper';

export default function SettingsLoading() {
    return (
        <Box>
            {/* Header Skeleton */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Skeleton variant="text" width={250} height={40} />
                <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    {/* General Information */}
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                            <Skeleton variant="text" width={180} height={28} />
                        </Box>
                        <Skeleton variant="rectangular" width="100%" height={1} sx={{ mb: 2 }} />
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} variant="rectangular" width="100%" height={56} sx={{ mb: 2, borderRadius: 1 }} />
                        ))}
                    </Paper>

                    {/* Integrations */}
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                            <Skeleton variant="text" width={120} height={28} />
                        </Box>
                        <Skeleton variant="rectangular" width="100%" height={1} sx={{ mb: 2 }} />
                        {[1, 2].map(i => (
                            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box>
                                    <Skeleton variant="text" width={80} height={24} />
                                    <Skeleton variant="text" width={180} height={18} />
                                </Box>
                                <Skeleton variant="rectangular" width={90} height={32} sx={{ borderRadius: 1 }} />
                            </Box>
                        ))}
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Skeleton variant="text" width={160} height={28} sx={{ mb: 2 }} />
                        <Skeleton variant="rectangular" width="100%" height={1} sx={{ mb: 2 }} />
                        {[1, 2].map(i => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <Skeleton variant="rectangular" width={40} height={24} sx={{ mr: 2, borderRadius: 12 }} />
                                <Skeleton variant="text" width={180} height={24} />
                            </Box>
                        ))}
                        <Box sx={{ mt: 3 }}>
                            <Skeleton variant="text" width={120} height={20} sx={{ mb: 1 }} />
                            <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
