import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';

interface RoleDistributionChartProps {
    data?: Array<{ label: string; value: number }>;
}

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

export default function RoleDistributionChart({ data }: RoleDistributionChartProps) {
    // Use provided data or fallback to mock data
    const chartData = data || [
        { label: 'Admin', value: 3 },
        { label: 'User', value: 25 },
        { label: 'Super Admin', value: 1 },
    ];

    const formattedData = chartData.map((item, index) => ({
        id: index,
        value: item.value,
        label: item.label,
        color: COLORS[index % COLORS.length],
    }));

    return (
        <PieChart
            series={[
                {
                    data: formattedData,
                    highlightScope: { fade: 'global', highlight: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -10, color: 'gray' },
                    innerRadius: 40,
                    outerRadius: 100,
                    paddingAngle: 3,
                    cornerRadius: 6,
                    cx: 120,
                },
            ]}
            height={300}
            width={350}
        />
    );
}
