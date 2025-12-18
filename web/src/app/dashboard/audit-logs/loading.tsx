import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Paper from '@mui/material/Paper';

export default function AuditLogsLoading() {
    return (
        <Box>
            {/* Header Skeleton */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Skeleton variant="text" width={160} height={40} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
                </Box>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
                    </Grid>
                </Grid>
            </Paper>

            {/* Logs List Skeleton */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
                    <Box key={item} sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ mr: 2 }}>
                            <Skeleton variant="circular" width={8} height={8} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Skeleton variant="rectangular" width={80} height={20} sx={{ borderRadius: 8 }} />
                                <Skeleton variant="text" width={120} height={18} />
                            </Box>
                            <Skeleton variant="text" width="60%" height={16} />
                        </Box>
                        <Skeleton variant="text" width={100} height={16} />
                    </Box>
                ))}
            </Paper>
        </Box>
    );
}
