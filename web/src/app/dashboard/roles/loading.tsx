import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Card from '@mui/material/Card';

export default function RolesLoading() {
    return (
        <Box sx={{ width: '100%' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
            </Box>

            {/* Table Skeleton */}
            <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Skeleton variant="rectangular" width="100%" height={56} sx={{ bgcolor: 'action.hover' }} />
                <Box sx={{ p: 2 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                            <Skeleton variant="text" width="20%" height={30} />
                            <Skeleton variant="text" width="40%" height={20} />
                            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 4 }} />
                            <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                                <Skeleton variant="circular" width={32} height={32} />
                                <Skeleton variant="circular" width={32} height={32} />
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Card>
        </Box>
    );
}
