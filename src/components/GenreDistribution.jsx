import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const GenreDistribution = ({ data }) => {
    // Elegant palette for genres
    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6', '#06b6d4', '#3b82f6'];

    if (!data || data.length === 0) {
        return <div className="h-64 flex items-center justify-center text-slate-400 text-sm">Aucun genre défini</div>;
    }

    return (
        <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        cornerRadius={6}
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            borderColor: '#334155',
                            borderRadius: '12px',
                            color: '#f8fafc',
                            fontSize: '12px'
                        }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }}
                    />
                </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pr-14">
                <span className="text-2xl font-bold dark:text-white block">{data.length}</span>
                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Genres</span>
            </div>
        </div>
    );
};

export default GenreDistribution;
