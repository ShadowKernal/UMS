import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export default function GroupsLoading() {
    return (
        <Box>
            {/* Header Skeleton */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: 1 }} />
            </Box>

            {/* Group Cards Skeleton */}
            <Grid container spacing={3}>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item}>
                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Skeleton variant="text" width="60%" height={24} />
                                        <Skeleton variant="text" width="40%" height={20} />
                                    </Box>
                                </Box>
                                <Skeleton variant="text" width="100%" height={20} />
                                <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    {[1, 2, 3].map(i => (
                                        <Skeleton key={i} variant="circular" width={28} height={28} />
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
