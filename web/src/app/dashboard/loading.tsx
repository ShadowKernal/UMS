import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export default function DashboardLoading() {
    return (
        <Box>
            {/* Header Skeleton */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Skeleton variant="text" width={200} height={40} />
                    <Skeleton variant="text" width={300} height={24} />
                </Box>
                <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
            </Box>

            {/* KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[1, 2, 3, 4].map((item) => (
                    /* @ts-expect-error Grid types mismatch */
                    <Grid item xs={12} sm={6} md={3} key={item}>
                        <Card sx={{ height: '100%', borderRadius: 3 }}>
                            <CardContent>
                                <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                                <Skeleton variant="text" width="80%" height={40} sx={{ mb: 1 }} />
                                <Skeleton variant="text" width="40%" height={20} />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Charts Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* @ts-expect-error Grid types mismatch */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ height: 400, borderRadius: 3, p: 2 }}>
                        <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 2 }} />
                    </Card>
                </Grid>
                {/* @ts-expect-error Grid types mismatch */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: 400, borderRadius: 3, p: 2 }}>
                        <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto', mt: 4 }} />
                        <Skeleton variant="text" width="80%" sx={{ mx: 'auto', mt: 4 }} />
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
