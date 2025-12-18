import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Card from '@mui/material/Card';

export default function TableLoading() {
    return (
        <Box sx={{ width: '100%' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Skeleton variant="text" width={150} height={40} />
                <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
            </Box>

            {/* Table/Grid Skeleton */}
            <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Skeleton variant="rectangular" width="100%" height={56} sx={{ bgcolor: 'action.hover' }} />
                <Box sx={{ p: 2 }}>
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Skeleton variant="circular" width={40} height={40} />
                            <Box sx={{ flex: 1 }}>
                                <Skeleton variant="text" width="30%" height={20} />
                                <Skeleton variant="text" width="20%" height={20} />
                            </Box>
                            <Skeleton variant="rectangular" width={100} height={30} sx={{ borderRadius: 1 }} />
                        </Box>
                    ))}
                </Box>
            </Card>
        </Box>
    );
}
