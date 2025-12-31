import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export const useReadingHeatmap = () => {
    return useLiveQuery(async () => {
        const sessions = await db.readingSessions.toArray();
        const heatmapData = {}; // { 'YYYY-MM-DD': pages }
        const dates = new Set();

        // 1. Aggregate pages per day
        sessions.forEach(session => {
            let dateStr;
            if (session.date instanceof Date) {
                dateStr = session.date.toISOString().split('T')[0];
            } else if (typeof session.date === 'string') {
                dateStr = session.date.split('T')[0];
            } else {
                return; // Skip invalid dates
            }
            heatmapData[dateStr] = (heatmapData[dateStr] || 0) + (session.pagesRead || 0);
            dates.add(dateStr);
        });

        // 2. Calculate Streaks
        const sortedDates = Array.from(dates).sort();
        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;

        // Helper to check if two dates are consecutive
        const isConsecutive = (d1, d2) => {
            const date1 = new Date(d1);
            const date2 = new Date(d2);
            const diffTime = Math.abs(date2 - date1);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays === 1;
        };

        // Best Streak Calculation
        for (let i = 0; i < sortedDates.length; i++) {
            if (i === 0) {
                tempStreak = 1;
            } else {
                if (isConsecutive(sortedDates[i - 1], sortedDates[i])) {
                    tempStreak++;
                } else {
                    tempStreak = 1;
                }
            }
            if (tempStreak > bestStreak) bestStreak = tempStreak;
        }

        // Current Streak Calculation
        // Check backwards from today/yesterday
        const today = new Date().toISOString().split('T')[0];
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        if (dates.has(today)) {
            // Streak includes today
            let streak = 0;
            let checkDate = new Date();

            while (true) {
                const dateStr = checkDate.toISOString().split('T')[0];
                if (dates.has(dateStr)) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
            currentStreak = streak;
        } else if (dates.has(yesterday)) {
            // Streak continues from yesterday
            let streak = 0;
            let checkDate = new Date();
            checkDate.setDate(checkDate.getDate() - 1); // Start from yesterday

            while (true) {
                const dateStr = checkDate.toISOString().split('T')[0];
                if (dates.has(dateStr)) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
            currentStreak = streak;
        } else {
            currentStreak = 0;
        }

        return {
            heatmapData,
            currentStreak,
            bestStreak,
            todayActivity: heatmapData[today] || 0
        };

    });
};
