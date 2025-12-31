import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import MonthlyChart from '../components/MonthlyChart';
import GenreDistribution from '../components/GenreDistribution';
import { Trophy, TrendingUp, Star, Zap, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const StatsPage = () => {
    // Fetch Data
    const data = useLiveQuery(async () => {
        const books = await db.books.toArray();
        const sessions = await db.readingSessions.toArray();
        const profile = (await db.userProfile.toArray())[0];

        return { books, sessions, profile };
    });

    const stats = useMemo(() => {
        if (!data) return null;
        const { books, sessions } = data;

        // 1. KPIs
        const finishedBooks = books.filter(b => b.status === 'finished').length;
        const totalPagesRead = sessions.reduce((sum, s) => sum + (s.pagesRead || 0), 0) +
            books.reduce((sum, b) => sum + (b.status === 'reading' ? b.currentPage : 0), 0); // Rough estimate fix

        // Avg Rating
        const ratedBooks = books.filter(b => b.rating > 0);
        const avgRating = ratedBooks.length > 0
            ? (ratedBooks.reduce((sum, b) => sum + b.rating, 0) / ratedBooks.length).toFixed(1)
            : '-';

        // Reading Speed (Pages / Hour)
        const timedSessions = sessions.filter(s => s.durationSeconds > 60);
        const avgSpeed = timedSessions.length > 0
            ? Math.round(timedSessions.reduce((sum, s) => sum + (s.pagesRead / (s.durationSeconds / 3600)), 0) / timedSessions.length)
            : 0;

        // 2. Monthly Data (Current Year)
        const currentYear = new Date().getFullYear();
        const monthlyData = Array(12).fill(0).map((_, i) => ({
            month: new Date(0, i).toLocaleString('default', { month: 'short' }),
            pages: 0,
            fullDate: i // sort key
        }));

        sessions.forEach(session => {
            const date = new Date(session.date);
            if (date.getFullYear() === currentYear) {
                monthlyData[date.getMonth()].pages += (session.pagesRead || 0);
            }
        });

        // 3. Genre Distribution
        const genreCounts = {};
        books.forEach(book => {
            if (book.tags && Array.isArray(book.tags)) {
                book.tags.forEach(tag => {
                    genreCounts[tag] = (genreCounts[tag] || 0) + 1;
                });
            }
        });

        const genreData = Object.entries(genreCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 7); // Top 7 genres

        return {
            finishedBooks,
            totalPagesRead,
            avgRating,
            avgSpeed,
            monthlyData,
            genreData,
            theme: data.profile?.theme || 'blue'
        };
    }, [data]);

    if (!stats) return <div className="p-10 text-center animate-pulse text-slate-400">Analyse de vos lectures...</div>;

    const sections = [
        { title: 'Pages Lues', value: stats.totalPagesRead.toLocaleString(), icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { title: 'Livres Terminés', value: stats.finishedBooks, sub: 'Sur l\'année', icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { title: 'Vitesse Moyenne', value: `${stats.avgSpeed} p/h`, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Note Moyenne', value: stats.avgRating, icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    ];

    return (
        <div className="space-y-6 pb-24">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Stats Center</h1>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 gap-4">
                {sections.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5"
                    >
                        <div className={`w-10 h-10 rounded-full ${item.bg} ${item.color} flex items-center justify-center mb-3`}>
                            <item.icon size={20} fill={item.title === 'Note Moyenne' ? 'currentColor' : 'none'} />
                        </div>
                        <p className="text-2xl font-bold dark:text-gray-100">{item.value}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{item.title}</p>
                        {item.sub && <p className="text-[10px] text-brand-500 font-medium mt-1">{item.sub}</p>}
                    </motion.div>
                ))}
            </div>

            {/* Charts Area */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                        <trending-up size={20} className="text-slate-400" />
                        Volume de lecture
                    </h3>
                    <select className="bg-slate-100 dark:bg-slate-700 text-xs rounded-lg px-2 py-1 outline-none">
                        <option>2025</option>
                    </select>
                </div>
                <div className="mb-2">
                    <MonthlyChart data={stats.monthlyData} theme={stats.theme} />
                </div>
                <p className="text-center text-xs text-slate-400 mt-2">Pages lues par mois</p>
            </div>

            {/* Genres */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5">
                <h3 className="font-bold text-lg dark:text-white mb-4">Genres Favoris</h3>
                <div className="flex items-center">
                    <GenreDistribution data={stats.genreData} />
                </div>
            </div>
        </div>
    );
};

export default StatsPage;
