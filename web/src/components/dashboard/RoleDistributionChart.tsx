import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';

const data = [
    { id: 0, value: 10, label: 'Admin' },
    { id: 1, value: 15, label: 'Manager' },
    { id: 2, value: 20, label: 'Member' },
    { id: 3, value: 5, label: 'Viewer' },
];

export default function RoleDistributionChart() {
    return (
        <PieChart
            series={[
                {
                    data,
                    highlightScope: { fade: 'global', highlight: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                    innerRadius: 30,
                    outerRadius: 100,
                    paddingAngle: 5,
                    cornerRadius: 5,
                },
            ]}
            height={300}
        />
    );
}
