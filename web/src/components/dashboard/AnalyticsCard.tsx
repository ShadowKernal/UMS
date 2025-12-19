import * as React from 'react';
import { motion } from 'framer-motion';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface AnalyticsCardProps {
    title: string;
    value?: string | number;
    subtitle?: React.ReactNode;
    tooltip?: string;
    children?: React.ReactNode;
    action?: React.ReactNode;
}

export default function AnalyticsCard({ title, value, subtitle, tooltip, children, action }: AnalyticsCardProps) {
    const MotionCard = motion(Card);

    return (
        <MotionCard
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                            {title}
                        </Typography>
                        {tooltip && (
                            <Tooltip title={tooltip}>
                                <InfoOutlinedIcon sx={{ ml: 1, fontSize: 16, color: 'text.disabled', cursor: 'help' }} />
                            </Tooltip>
                        )}
                    </Box>
                    {action}
                </Box>

                {value && (
                    <Typography variant="h4" component="div" sx={{ mb: 0.5, fontWeight: 600 }}>
                        {value}
                    </Typography>
                )}

                {subtitle && (
                    typeof subtitle === 'string' ? (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {subtitle}
                        </Typography>
                    ) : (
                        <Box sx={{ mb: 2 }}>
                            {subtitle}
                        </Box>
                    )
                )}

                <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                    {children}
                </Box>
            </CardContent>
        </MotionCard>
    );
}
