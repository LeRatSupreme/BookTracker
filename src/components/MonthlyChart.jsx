import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

const MonthlyChart = ({ data, theme = 'blue' }) => {
    // Generate gradient ID based on theme
    const gradientId = `barGradient-${theme}`;

    // Map themes to colors
    const colors = {
        blue: { start: '#60a5fa', end: '#2563eb' }, // blue-400 to blue-600
        purple: { start: '#c084fc', end: '#9333ea' }, // purple-400 to purple-600
        green: { start: '#4ade80', end: '#16a34a' }, // green-400 to green-600
        orange: { start: '#fb923c', end: '#ea580c' }, // orange-400 to orange-600
    };

    const themeColor = colors[theme] || colors.blue;

    if (!data || data.length === 0) {
        return <div className="h-64 flex items-center justify-center text-slate-400 text-sm">Aucune donnée disponible</div>;
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={themeColor.start} stopOpacity={1} />
                            <stop offset="100%" stopColor={themeColor.end} stopOpacity={0.8} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            borderColor: '#334155',
                            borderRadius: '12px',
                            color: '#f8fafc',
                            fontSize: '12px'
                        }}
                        cursor={{ fill: 'transparent' }}
                    />
                    <Bar dataKey="pages" radius={[4, 4, 0, 0]} animationDuration={1500}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`url(#${gradientId})`} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MonthlyChart;
