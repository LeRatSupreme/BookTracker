import React from 'react';
import { useReadingHeatmap } from '../hooks/useReadingHeatmap';
import { Flame, Trophy, Calendar } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const ReadingHeatmap = ({ theme = 'blue' }) => {
    const data = useReadingHeatmap();

    if (!data) return <div className="animate-pulse h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl" />;

    const { heatmapData, currentStreak, bestStreak } = data;

    // Generate last 365 days
    const today = new Date();
    const days = [];
    for (let i = 364; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    // Color Scales based on Theme
    const getColor = (count) => {
        if (count === 0) return 'bg-slate-100 dark:bg-slate-800';

        // Intensity thresholds
        let intensity = 1;
        if (count >= 20) intensity = 2;
        if (count >= 50) intensity = 3;
        if (count >= 100) intensity = 4;

        // Map themes to Tailwind classes (Safelisted approach via full strings)
        const colors = {
            blue: ['bg-blue-200', 'bg-blue-400', 'bg-blue-500', 'bg-blue-600'],
            purple: ['bg-purple-200', 'bg-purple-400', 'bg-purple-500', 'bg-purple-600'],
            green: ['bg-green-200', 'bg-green-400', 'bg-green-500', 'bg-green-600'],
            orange: ['bg-orange-200', 'bg-orange-400', 'bg-orange-500', 'bg-orange-600'],
        };

        const themeColors = colors[theme] || colors.blue;
        return themeColors[intensity - 1];
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 space-y-6">

            {/* Header Stats */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                        <Calendar size={20} className="text-slate-400" />
                        Activité de lecture
                    </h3>
                    <p className="text-xs text-slate-400">Derniers 365 jours</p>
                </div>

                <div className="flex gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Série en cours</span>
                        <div className="flex items-center gap-1 text-lg font-black dark:text-white">
                            <span>{currentStreak}</span>
                            <Flame
                                size={20}
                                className={clsx(
                                    currentStreak > 0 ? "text-orange-500 fill-orange-500 animate-pulse" : "text-slate-300"
                                )}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Record</span>
                        <div className="flex items-center gap-1 text-lg font-black text-slate-400 dark:text-slate-500">
                            <span>{bestStreak}</span>
                            <Trophy size={16} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                <div className="min-w-[700px]"> {/* Ensure min width for desktop grid */}
                    <div className="grid grid-cols-[repeat(53,1fr)] grid-flow-col gap-1 auto-cols-auto">
                        {days.map((date, index) => {
                            const count = heatmapData[date] || 0;
                            return (
                                <motion.div
                                    key={date}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: index * 0.001 }}
                                    className={clsx(
                                        "w-full aspect-square rounded-[2px] cursor-pointer transition-colors relative group",
                                        getColor(count)
                                    )}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                        <span className="font-bold">{new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} : </span>
                                        {count > 0 ? `${count} pages` : 'Aucune lecture'}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex justify-end items-center gap-2 text-[10px] text-slate-400 font-medium">
                <span>Moins</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 bg-slate-100 dark:bg-slate-700 rounded-[2px]" />
                    <div className={`w-3 h-3 rounded-[2px] bg-${theme}-200`} />
                    <div className={`w-3 h-3 rounded-[2px] bg-${theme}-400`} />
                    <div className={`w-3 h-3 rounded-[2px] bg-${theme}-600`} />
                </div>
                <span>Plus</span>
            </div>
        </div>
    );
};

export default ReadingHeatmap;
