import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, BookOpen, Layers, Download } from 'lucide-react';

import RecommendationEngine from '../components/RecommendationEngine';

const Dashboard = () => {
    // ... (keep query)
    const stats = useLiveQuery(async () => {
        // ...
        const allBooks = await db.books.toArray();

        // Core stats
        const finishedBooks = allBooks.filter(b => b.status === 'finished');
        const totalPagesRead = finishedBooks.reduce((sum, book) => sum + (book.pages || 0), 0) +
            allBooks.filter(b => b.status === 'reading').reduce((sum, book) => sum + (book.currentPage || 0), 0);

        // Chart data
        const data = [
            { name: 'Lus', count: finishedBooks.length, color: '#22c55e' },
            { name: 'En cours', count: allBooks.filter(b => b.status === 'reading').length, color: '#3b82f6' },
            { name: 'À lire', count: allBooks.filter(b => b.status === 'tbr').length, color: '#64748b' },
        ];

        return { totalBooks: allBooks.length, finishedCount: finishedBooks.length, totalPagesRead, data, allBooks };
    });

    const exportData = () => {
        if (!stats?.allBooks) return;
        const blob = new Blob([JSON.stringify(stats.allBooks, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `book-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
    };

    if (!stats) return <div className="p-10 text-center">Chargement...</div>;

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-xl font-bold p-1">Tableau de bord</h2>

            {/* AI Recommendation */}
            <RecommendationEngine />

            {/* Hero Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-brand-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg shadow-brand-500/30">
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                        <Trophy size={18} />
                        <span className="text-xs font-bold uppercase">Livres Terminés</span>
                    </div>
                    <p className="text-4xl font-bold">{stats.finishedCount}</p>
                    <p className="text-xs opacity-70 mt-1">sur {stats.totalBooks} livres</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2 text-slate-400">
                        <Layers size={18} />
                        <span className="text-xs font-bold uppercase">Pages Lues</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats.totalPagesRead.toLocaleString()}</p>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-500 mb-4">Activité de lecture</h3>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.data}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: 'transparent' }}
                            />
                            <Bar dataKey="count" radius={[8, 8, 8, 8]}>
                                {stats.data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Export Action */}
            <button
                onClick={exportData}
                className="w-full flex items-center justify-center gap-2 p-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-medium active:scale-95 transition-transform"
            >
                <Download size={20} />
                Exporter mes données (JSON)
            </button>

        </div>
    );
};

export default Dashboard;
