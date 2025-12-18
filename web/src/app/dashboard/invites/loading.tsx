import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export default function InvitesLoading() {
    return (
        <Box>
            {/* Header Skeleton */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
            </Box>

            {/* Stats Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[1, 2, 3].map((item) => (
                    <Grid size={{ xs: 12, sm: 4 }} key={item}>
                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Skeleton variant="text" width="50%" height={40} sx={{ mx: 'auto' }} />
                                <Skeleton variant="text" width="70%" height={20} sx={{ mx: 'auto' }} />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Invites Table Skeleton */}
            <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                {/* Table Header */}
                <Box sx={{ display: 'flex', p: 2, bgcolor: 'action.hover' }}>
                    <Skeleton variant="text" width="30%" height={20} sx={{ mr: 2 }} />
                    <Skeleton variant="text" width="20%" height={20} sx={{ mr: 2 }} />
                    <Skeleton variant="text" width="20%" height={20} sx={{ mr: 2 }} />
                    <Skeleton variant="text" width="20%" height={20} />
                </Box>

                {/* Table Rows */}
                {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Box key={item} sx={{ display: 'flex', alignItems: 'center', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Skeleton variant="text" width="30%" height={20} sx={{ mr: 2 }} />
                        <Skeleton variant="rectangular" width={80} height={24} sx={{ mr: 2, borderRadius: 12 }} />
                        <Skeleton variant="text" width="20%" height={20} sx={{ mr: 2 }} />
                        <Box sx={{ width: '20%', display: 'flex', gap: 1 }}>
                            <Skeleton variant="rectangular" width={70} height={30} sx={{ borderRadius: 1 }} />
                            <Skeleton variant="rectangular" width={70} height={30} sx={{ borderRadius: 1 }} />
                        </Box>
                    </Box>
                ))}
            </Card>
        </Box>
    );
}
