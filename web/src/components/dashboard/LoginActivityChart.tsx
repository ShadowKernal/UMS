import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';

const uData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
const pData = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
const xLabels = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
];

export default function LoginActivityChart() {
    const theme = useTheme();

    return (
        <BarChart
            height={300}
            series={[
                { data: pData, label: 'Successful', id: 'pvId', stack: 'total', color: theme.palette.success.main },
                { data: uData, label: 'Failed', id: 'uvId', stack: 'total', color: theme.palette.error.main },
            ]}
            xAxis={[{ data: xLabels, scaleType: 'band' }]}
        />
    );
}
