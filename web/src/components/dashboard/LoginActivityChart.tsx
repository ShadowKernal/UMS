import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';

interface LoginActivityChartProps {
    data?: Array<{ day: string; success: number; failed: number }>;
}

export default function LoginActivityChart({ data }: LoginActivityChartProps) {
    const theme = useTheme();

    // Use provided data or fallback to mock data
    const chartData = data || [
        { day: 'Mon', success: 24, failed: 4 },
        { day: 'Tue', success: 30, failed: 3 },
        { day: 'Wed', success: 28, failed: 8 },
        { day: 'Thu', success: 35, failed: 2 },
        { day: 'Fri', success: 32, failed: 5 },
        { day: 'Sat', success: 15, failed: 1 },
        { day: 'Sun', success: 12, failed: 2 },
    ];

    return (
        <BarChart
            height={300}
            series={[
                {
                    data: chartData.map(d => d.success),
                    label: 'Successful',
                    id: 'success',
                    stack: 'total',
                    color: theme.palette.success.main,
                },
                {
                    data: chartData.map(d => d.failed),
                    label: 'Failed',
                    id: 'failed',
                    stack: 'total',
                    color: theme.palette.error.main,
                },
            ]}
            xAxis={[{ data: chartData.map(d => d.day), scaleType: 'band' }]}
            sx={{
                '.MuiBarElement-root': {
                    rx: 4,
                },
            }}
        />
    );
}
