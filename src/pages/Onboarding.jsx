import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import { ChevronRight, Check } from 'lucide-react';

const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [goal, setGoal] = useState(12);
    const [theme, setTheme] = useState('blue'); // blue, purple, green

    const themes = {
        blue: 'from-blue-500 to-cyan-500',
        purple: 'from-purple-500 to-pink-500',
        green: 'from-emerald-500 to-teal-500',
    };

    const handleNext = () => {
        if (step < 2) {
            setStep(step + 1);
        } else {
            handleFinish();
        }
    };

    const handleFinish = async () => {
        await db.userProfile.add({
            name,
            annualGoal: goal,
            theme,
            xp: 0,
            badges: [],
            joinedDate: new Date()
        });
        navigate('/');
    };

    const variants = {
        initial: { x: 50, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -50, opacity: 0 }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 overflow-hidden relative">
            {/* Background Blobs */}
            <div className={`absolute top-0 left-0 w-64 h-64 bg-gradient-to-br ${themes[theme]} opacity-20 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 transition-colors duration-1000`} />
            <div className={`absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr ${themes[theme]} opacity-10 blur-3xl rounded-full translate-x-1/3 translate-y-1/3 transition-colors duration-1000`} />

            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl text-white relative z-10">
                <div className="mb-8 flex justify-center gap-2">
                    {[0, 1, 2].map(i => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? `w-8 bg-gradient-to-r ${themes[theme]}` : 'w-2 bg-white/20'}`} />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit" className="space-y-6 text-center">
                            <h2 className="text-3xl font-bold">Bienvenue 👋</h2>
                            <p className="text-slate-300">Commençons par faire connaissance. Comment t'appelles-tu ?</p>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ton prénom"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-xl focus:outline-none focus:border-white/30 transition-colors placeholder:text-slate-600"
                                autoFocus
                            />
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit" className="space-y-8 text-center">
                            <h2 className="text-2xl font-bold">Objectif Annuel 🎯</h2>
                            <p className="text-slate-300">Combien de livres aimerais-tu lire cette année ?</p>

                            <div className="relative pt-6 pb-2">
                                <div className="text-6xl font-black bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                                    {goal}
                                </div>
                                <p className="text-sm font-medium text-slate-400 mt-2">LIVRES</p>

                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={goal}
                                    onChange={(e) => setGoal(Number(e.target.value))}
                                    className="w-full mt-8 accent-white h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step3" variants={variants} initial="initial" animate="animate" exit="exit" className="space-y-6 text-center">
                            <h2 className="text-2xl font-bold">Ton Style 🎨</h2>
                            <p className="text-slate-300">Choisis l'ambiance de ton application.</p>

                            <div className="grid grid-cols-3 gap-4 mt-8">
                                {Object.entries(themes).map(([key, gradient]) => (
                                    <button
                                        key={key}
                                        onClick={() => setTheme(key)}
                                        className={`relative aspect-square rounded-2xl bg-gradient-to-br ${gradient} border-4 transition-all ${theme === key ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                                    >
                                        {theme === key && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Check className="text-white drop-shadow-md" size={32} strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={handleNext}
                    disabled={step === 0 && name.length === 0}
                    className={`mt-10 w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-black/20 ${step === 0 && name.length === 0 ? 'bg-white/10 text-white/30 cursor-not-allowed' : `bg-gradient-to-r ${themes[theme]} hover:brightness-110 active:scale-95 text-white`}`}
                >
                    {step === 2 ? "C'est parti !" : "Continuer"}
                    {step < 2 && <ChevronRight size={20} />}
                </button>
            </div>
        </div>
    );
};

export default Onboarding;
