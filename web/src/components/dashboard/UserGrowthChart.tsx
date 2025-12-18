import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { useTheme } from '@mui/material/styles';

const uData = [400, 300, 200, 278, 189, 239, 349];
const pData = [240, 139, 980, 390, 480, 380, 430];
const xLabels = [
    'Page A',
    'Page B',
    'Page C',
    'Page D',
    'Page E',
    'Page F',
    'Page G',
];

export default function UserGrowthChart() {
    const theme = useTheme();

    return (
        <LineChart
            height={300}
            series={[
                { data: pData, label: 'Active Users', color: theme.palette.primary.main },
                { data: uData, label: 'New Signups', color: theme.palette.secondary.main },
            ]}
            xAxis={[{ scaleType: 'point', data: xLabels }]}
            sx={{
                '.MuiLineElement-root': {
                    strokeWidth: 2,
                },
                '.MuiMarkElement-root': {
                    scale: '0.6',
                    fill: '#fff',
                    strokeWidth: 2,
                },
            }}
        />
    );
}
