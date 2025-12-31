import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Square, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const ReadingSession = ({ book, onClose, onSaveSession }) => {
    const [phase, setPhase] = useState('timer'); // 'timer' | 'summary'
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [endPage, setEndPage] = useState(book.currentPage);
    const wakeLockRef = useRef(null);

    // Format time HH:MM:SS
    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // WakeLock & Timer Effect
    useEffect(() => {
        let interval = null;

        const requestWakeLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    wakeLockRef.current = await navigator.wakeLock.request('screen');
                }
            } catch (err) {
                console.error('Wake Lock failed:', err);
            }
        };

        if (isActive && phase === 'timer') {
            requestWakeLock();
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        } else if (!isActive && interval) {
            clearInterval(interval);
        }

        return () => {
            clearInterval(interval);
            if (wakeLockRef.current) {
                wakeLockRef.current.release().catch(e => console.error(e));
                wakeLockRef.current = null;
            }
        };
    }, [isActive, phase]);

    // Calculate Stats
    const pagesRead = Math.max(0, endPage - book.currentPage);
    const progressPercent = book.pages > 0 ? Math.round((endPage / book.pages) * 100) : 0;

    // Pages per hour calculation
    const speed = seconds > 60 ? Math.round((pagesRead / (seconds / 3600))) : 0;

    const handleStop = () => {
        setIsActive(false);
        setPhase('summary');
        // Release wake lock immediately when stopping
        if (wakeLockRef.current) {
            wakeLockRef.current.release().catch(e => console.error(e));
            wakeLockRef.current = null;
        }
    };

    const handleFinish = () => {
        onSaveSession({
            durationSeconds: seconds,
            pagesRead: pagesRead,
            endPage: Number(endPage),
            date: new Date()
        });
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex flex-col bg-slate-900 text-white"
            >
                {/* Background Blur */}
                <div
                    className="absolute inset-0 z-0 opacity-30 blur-3xl bg-cover bg-center transition-all duration-1000"
                    style={{ backgroundImage: `url(${book.cover})` }}
                />
                <div className="absolute inset-0 bg-black/60 z-0" />

                {/* Content */}
                <div className="relative z-10 flex-1 flex flex-col">

                    {/* Header */}
                    <div className="p-6 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <img src={book.cover} alt="" className="w-10 h-16 object-cover rounded shadow-md opacity-80" />
                            <div>
                                <h3 className="font-medium text-white/90 line-clamp-1">{book.title}</h3>
                                <p className="text-xs text-white/60">{book.author}</p>
                            </div>
                        </div>
                        {phase === 'timer' && (
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {/* Main Area */}
                    <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">

                        {phase === 'timer' ? (
                            <>
                                <motion.div
                                    className="text-center space-y-2"
                                    animate={{ scale: isActive ? [1, 1.02, 1] : 1 }}
                                    transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
                                >
                                    <div className="text-7xl font-light tracking-wider font-mono tabular-nums">
                                        {formatTime(seconds)}
                                    </div>
                                    <p className="text-white/40 uppercase tracking-widest text-xs font-bold">
                                        Focus Mode
                                    </p>
                                </motion.div>

                                <div className="flex items-center gap-6 mt-8">
                                    <button
                                        onClick={() => setIsActive(!isActive)}
                                        className={clsx(
                                            "w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95",
                                            isActive ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                                        )}
                                    >
                                        {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                                    </button>

                                    {!isActive && seconds > 0 && (
                                        <motion.button
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            onClick={handleStop}
                                            className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg active:scale-95"
                                        >
                                            <Square size={28} fill="currentColor" />
                                        </motion.button>
                                    )}
                                </div>
                            </>
                        ) : (
                            // Summary Phase
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="w-full max-w-sm space-y-8 bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10"
                            >
                                <div className="text-center space-y-1">
                                    <h2 className="text-2xl font-bold">Session terminée</h2>
                                    <div className="flex justify-center items-center gap-2 text-white/60">
                                        <Clock size={16} />
                                        <span>{formatTime(seconds)}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-center text-white/80">
                                        À quelle page t'es-tu arrêté ?
                                        <span className="block text-xs text-white/50 font-normal mt-1">(Début : {book.currentPage})</span>
                                    </label>

                                    <div className="flex items-center gap-4 justify-center">
                                        <button
                                            onClick={() => setEndPage(p => Math.max(book.currentPage, p - 1))}
                                            className="w-12 h-12 shrink-0 rounded-xl bg-white/10 flex items-center justify-center text-2xl active:scale-95 transition-transform"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={endPage}
                                            onChange={(e) => setEndPage(Number(e.target.value))}
                                            className="w-24 bg-transparent border-b-2 border-white/30 text-center text-4xl font-bold py-2 focus:outline-none focus:border-white appearance-none"
                                            style={{ minWidth: '80px' }}
                                        />
                                        <button
                                            onClick={() => setEndPage(p => p + 1)}
                                            className="w-12 h-12 shrink-0 rounded-xl bg-white/10 flex items-center justify-center text-2xl active:scale-95 transition-transform"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {pagesRead > 0 && (
                                    <div className="p-4 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-center">
                                        <p className="text-emerald-300 font-bold mb-1">Bravo ! 🔥</p>
                                        <p className="text-sm text-emerald-100/80">
                                            Tu as lu <strong>{pagesRead} pages</strong> à une vitesse de <strong>{speed} p/h</strong>.
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={handleFinish}
                                    className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={20} />
                                    Enregistrer la session
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ReadingSession;
