import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Play, Pause, StopCircle, Clock } from 'lucide-react';

const FocusMode = () => {
    const [isActive, setIsActive] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [selectedBookId, setSelectedBookId] = useState('');

    const books = useLiveQuery(() => db.books.where('status').equals('reading').toArray());

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds + 1);
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleStop = async () => {
        setIsActive(false);
        if (selectedBookId && seconds > 60) {
            // Save session
            await db.readingSessions.add({
                bookId: Number(selectedBookId),
                duration: seconds,
                date: new Date()
            });
            alert("Session enregistrée ! Bonne lecture.");
        }
        setSeconds(0);
    };

    return (
        <div className="h-[80vh] flex flex-col items-center justify-center space-y-10 text-center">

            <div className="space-y-4">
                <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Clock size={40} />
                </div>
                <h2 className="text-2xl font-bold">Mode Focus</h2>

                {isActive ? (
                    <p className="text-slate-500 animate-pulse">Lecture en cours...</p>
                ) : (
                    <select
                        className="input-field text-center"
                        value={selectedBookId}
                        onChange={(e) => setSelectedBookId(e.target.value)}
                    >
                        <option value="">Choisir un livre à lire</option>
                        {books?.map(b => (
                            <option key={b.id} value={b.id}>{b.title}</option>
                        ))}
                    </select>
                )}
            </div>

            <div className={`text-7xl font-black font-mono tracking-wider transition-colors ${isActive ? 'text-brand-600' : 'text-slate-800 dark:text-white'}`}>
                {formatTime(seconds)}
            </div>

            <div className="flex gap-6">
                {!isActive ? (
                    <button
                        onClick={() => setIsActive(true)}
                        disabled={!selectedBookId}
                        className="w-20 h-20 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-xl shadow-brand-500/40 active:scale-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Play size={32} fill="currentColor" />
                    </button>
                ) : (
                    <>
                        <button
                            onClick={() => setIsActive(false)}
                            className="w-20 h-20 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xl shadow-amber-500/40 active:scale-90 transition-all"
                        >
                            <Pause size={32} fill="currentColor" />
                        </button>
                        <button
                            onClick={handleStop}
                            className="w-20 h-20 rounded-full bg-slate-700 text-white flex items-center justify-center shadow-xl active:scale-90 transition-all"
                        >
                            <StopCircle size={32} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default FocusMode;
