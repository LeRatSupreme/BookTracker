import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, Plus, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

const Layout = () => {
    const location = useLocation();
    const profile = useLiveQuery(async () => {
        return (await db.userProfile.toArray())[0];
    });

    return (
        <div className="flex flex-col min-h-screen max-w-md mx-auto relative overflow-hidden shadow-2xl selection:bg-brand-200">

            {/* Global Background Gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-brand-50/50 via-white to-brand-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 -z-10 pointer-events-none" />

            {/* Header */}
            <header className="sticky top-0 z-30 px-6 py-4 flex justify-between items-center bg-transparent backdrop-blur-sm">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Book<span className="text-brand-600">Tracker</span>.
                </h1>
                <NavLink to="/profile" className="w-10 h-10 rounded-full bg-brand-50 border-2 border-brand-200 overflow-hidden active:scale-95 transition-transform cursor-pointer shadow-sm flex items-center justify-center">
                    {profile?.avatar ? (
                        <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-sm font-bold text-brand-600">
                            {profile?.name?.charAt(0) || '👤'}
                        </div>
                    )}
                </NavLink>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto px-4 sm:px-6 relative pb-28">
                <Outlet />
            </main>

            {/* Bottom Navigation (Floating Island) */}
            <nav className="fixed bottom-6 left-6 right-6 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-2xl rounded-2xl p-2 flex justify-around items-center max-w-md mx-auto">
                <NavLink to="/" className={({ isActive }) => `flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition-all ${isActive ? 'text-brand-600 bg-brand-50 dark:bg-white/5 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
                    {({ isActive }) => (
                        <>
                            <BookOpen size={24} strokeWidth={isActive ? 2.5 : 2} />
                            {isActive && <span className="text-[10px] font-bold mt-1">Livres</span>}
                        </>
                    )}
                </NavLink>

                <NavLink to="/add" className="relative -top-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-500 to-brand-400 shadow-xl shadow-brand-500/40 flex items-center justify-center text-white transform transition-transform active:scale-90 hover:scale-105 border-4 border-white dark:border-slate-900">
                        <Plus size={32} strokeWidth={3} />
                    </div>
                </NavLink>

                <NavLink to="/stats" className={({ isActive }) => `flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition-all ${isActive ? 'text-brand-600 bg-brand-50 dark:bg-white/5 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
                    {({ isActive }) => (
                        <>
                            <BarChart2 size={24} strokeWidth={isActive ? 2.5 : 2} />
                            {isActive && <span className="text-[10px] font-bold mt-1">Stats</span>}
                        </>
                    )}
                </NavLink>
            </nav>
        </div>
    );
};

export default Layout;
