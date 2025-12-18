import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { useTheme } from '@mui/material/styles';

interface UserGrowthChartProps {
    data?: Array<{ day: string; signups: number; active: number }>;
}

export default function UserGrowthChart({ data }: UserGrowthChartProps) {
    const theme = useTheme();

    // Use provided data or fallback to mock data
    const chartData = data || [
        { day: 'Mon', signups: 5, active: 12 },
        { day: 'Tue', signups: 8, active: 15 },
        { day: 'Wed', signups: 3, active: 18 },
        { day: 'Thu', signups: 12, active: 22 },
        { day: 'Fri', signups: 7, active: 19 },
        { day: 'Sat', signups: 2, active: 10 },
        { day: 'Sun', signups: 4, active: 8 },
    ];

    return (
        <LineChart
            height={300}
            series={[
                {
                    data: chartData.map(d => d.active),
                    label: 'Active Users',
                    color: theme.palette.primary.main,
                    area: true,
                    curve: 'catmullRom',
                },
                {
                    data: chartData.map(d => d.signups),
                    label: 'New Signups',
                    color: theme.palette.secondary.main,
                    curve: 'catmullRom',
                },
            ]}
            xAxis={[{ scaleType: 'point', data: chartData.map(d => d.day) }]}
            sx={{
                '.MuiLineElement-root': {
                    strokeWidth: 2.5,
                },
                '.MuiMarkElement-root': {
                    scale: '0.7',
                    fill: theme.palette.background.paper,
                    strokeWidth: 2,
                },
                '.MuiAreaElement-root': {
                    fillOpacity: 0.1,
                },
            }}
        />
    );
}
