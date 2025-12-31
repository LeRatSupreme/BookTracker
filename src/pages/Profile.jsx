import React, { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Trophy, Medal, Flame, Star, Zap, Edit2, Archive, Download, Upload, Trash2, Sun, Moon, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import AvatarUploader from '../components/AvatarUploader';
import ReadingHeatmap from '../components/ReadingHeatmap';

const Profile = () => {
    const fileInputRef = useRef(null);
    const [selectedBadge, setSelectedBadge] = useState(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editName, setEditName] = useState('');

    const data = useLiveQuery(async () => {
        // ... (keep query same)
        const profile = (await db.userProfile.toArray())[0];
        const books = await db.books.toArray();
        if (!profile) return null;

        const totalPages = books.reduce((acc, book) => acc + (book.status === 'reading' ? book.currentPage : (book.status === 'finished' ? book.pages : 0)), 0);
        const finishedBooks = books.filter(b => b.status === 'finished').length;
        const level = Math.floor(totalPages / 500) + 1;
        const progressToNextLevel = Math.min(100, ((totalPages % 500) / 500) * 100);
        const challengeProgress = Math.min(100, (finishedBooks / (profile.annualGoal || 20)) * 100);

        return { profile, totalPages, finishedBooks, level, progressToNextLevel, challengeProgress };
    });

    if (!data?.profile) return null;
    const { profile, finishedBooks, level, progressToNextLevel, challengeProgress } = data;

    // --- Actions ---
    const updateProfile = async (updates) => {
        if (profile.id) {
            await db.userProfile.update(profile.id, updates);
        }
    };

    // ... (keep export/import/reset same)
    const handleExport = async () => {
        const books = await db.books.toArray();
        const exportData = {
            userProfile: [profile],
            books: books,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `booktracker_backup_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                if (window.confirm("Attention : L'importation remplacera vos données actuelles. Continuer ?")) {
                    await db.transaction('rw', db.userProfile, db.books, async () => {
                        await db.userProfile.clear();
                        await db.books.clear();
                        if (importedData.userProfile) await db.userProfile.bulkAdd(importedData.userProfile);
                        if (importedData.books) await db.books.bulkAdd(importedData.books);
                    });
                    alert("Importation réussie !");
                    window.location.reload();
                }
            } catch (error) {
                alert("Erreur lors de l'import : fichier invalide.");
                console.error(error);
            }
        };
        reader.readAsText(file);
    };

    const handleReset = async () => {
        if (window.confirm("⚠️ DANGER : Êtes-vous sûr de vouloir tout effacer ? Cette action est irréversible.")) {
            if (window.confirm("Vraiment sûr ? Toutes vos lectures seront perdues.")) {
                await db.delete();
                window.location.reload();
            }
        }
    };

    const badges = [
        { id: 'first_step', icon: Medal, label: "Premier Pas", desc: "Créer votre profil", unlocked: true, color: "yellow" },
        { id: 'fan', icon: Star, label: "Fan de Lecture", desc: "Finir 5 livres", unlocked: finishedBooks >= 5, color: "purple" },
        { id: 'devourer', icon: Zap, label: "Dévoreur", desc: "Lire 1000 pages", unlocked: data.totalPages >= 1000, color: "blue" },
    ];

    return (
        <div className="space-y-8 pb-4">
            {/* Header Profile */}
            <div className="flex items-center gap-6 relative">
                <AvatarUploader
                    currentAvatar={profile.avatar}
                    name={profile.name}
                    theme={profile.theme}
                    onUpdate={(newAvatar) => updateProfile({ avatar: newAvatar })}
                />

                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold dark:text-white">{profile.name}</h2>
                        <button onClick={() => { setEditName(profile.name); setIsEditingProfile(true); }} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-brand-500">
                            <Edit2 size={12} />
                        </button>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-1">
                        <Flame size={14} className="text-orange-500 fill-orange-500" />
                        Niveau {level} • "Rat de Bibliothèque"
                    </p>
                </div>
            </div>

            {/* Level Progress */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                    <span>Niveau {level}</span>
                    <span>Niveau {level + 1}</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressToNextLevel}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r from-${profile.theme}-400 to-${profile.theme}-600`}
                    />
                </div>
                <p className="text-xs text-center mt-2 text-slate-400">Encore {500 - (data.totalPages % 500)} pages pour le niveau supérieur !</p>
            </div>

            {/* Reading Heatmap */}
            <ReadingHeatmap theme={profile.theme} />

            {/* Annual Goal */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Trophy size={100} />
                </div>
                <h3 className="text-lg font-bold mb-1">Challenge {new Date().getFullYear()}</h3>
                <p className="opacity-80 text-sm mb-6">Objectif : {profile.annualGoal} livres</p>

                <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-black">{finishedBooks}</span>
                    <span className="text-xl font-medium opacity-50 mb-1">/ {profile.annualGoal}</span>
                </div>

                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${challengeProgress}%` }}
                        transition={{ duration: 1.2, delay: 0.2 }}
                        className="h-full bg-white"
                    />
                </div>
            </div>

            {/* Gamification / Badges */}
            <div>
                <h3 className="font-bold text-lg mb-4 dark:text-white">Badges</h3>
                <div className="grid grid-cols-3 gap-3">
                    {badges.map(badge => (
                        <motion.div
                            key={badge.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedBadge(badge)}
                            className={clsx(
                                "aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 border-2 cursor-pointer transition-colors",
                                badge.unlocked
                                    ? `bg-${badge.color}-50 dark:bg-${badge.color}-900/10 border-${badge.color}-200 dark:border-${badge.color}-700/50`
                                    : "bg-slate-50 dark:bg-slate-800 border-dashed border-slate-200 dark:border-slate-700 opacity-60"
                            )}
                        >
                            <badge.icon
                                className={badge.unlocked ? `text-${badge.color}-600 dark:text-${badge.color}-400` : "text-slate-400"}
                                fill={badge.unlocked ? "currentColor" : "none"}
                                size={32}
                            />
                            <span className={clsx(
                                "text-[10px] font-bold text-center uppercase leading-tight",
                                badge.unlocked ? `text-${badge.color}-800 dark:text-${badge.color}-300` : "text-slate-400"
                            )}>{badge.label}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* --- Settings Section --- */}
            <div>
                <h3 className="font-bold text-lg mb-4 dark:text-white">Personnalisation</h3>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5 space-y-6">

                    {/* Theme Selector */}
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">Couleur de l'application</label>
                        <div className="flex gap-4">
                            {[
                                { name: 'blue', bg: 'bg-blue-500' },
                                { name: 'purple', bg: 'bg-purple-500' },
                                { name: 'green', bg: 'bg-green-500' },
                                { name: 'orange', bg: 'bg-orange-500' }
                            ].map(themeOption => (
                                <button
                                    key={themeOption.name}
                                    onClick={() => updateProfile({ theme: themeOption.name })}
                                    className={clsx(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                        themeOption.bg,
                                        profile.theme === themeOption.name ? "ring-4 ring-offset-2 ring-slate-200 dark:ring-slate-700 scale-110" : "opacity-70 hover:opacity-100"
                                    )}
                                >
                                    {profile.theme === themeOption.name && <Check size={16} className="text-white" strokeWidth={3} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-700" />

                    {/* Dark Mode Toggle */}
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Mode Apparence</label>
                        <button
                            onClick={() => updateProfile({ mode: profile.mode === 'dark' ? 'light' : 'dark' })}
                            className="bg-slate-200 dark:bg-slate-700 p-1 rounded-full flex items-center relative w-14 transition-colors"
                        >
                            <motion.div
                                layout
                                className="w-6 h-6 bg-white dark:bg-slate-900 rounded-full shadow-sm flex items-center justify-center text-xs"
                                style={{
                                    marginLeft: profile.mode === 'dark' ? 'auto' : 0,
                                    marginRight: profile.mode === 'dark' ? 0 : 'auto'
                                }}
                            >
                                {profile.mode === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
                            </motion.div>
                        </button>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-700" />

                    {/* Annual Goal Slider */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Objectif Annuel</label>
                            <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{profile.annualGoal} Livres</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            value={profile.annualGoal || 20}
                            onChange={(e) => updateProfile({ annualGoal: Number(e.target.value) })}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full accent-brand-500 cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* --- Data Management --- */}
            <div>
                <h3 className="font-bold text-lg mb-4 dark:text-white">Données</h3>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-1 shadow-sm border border-slate-100 dark:border-white/5 divide-y divide-slate-100 dark:divide-slate-700">
                    <button onClick={handleExport} className="w-full text-left p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                            <Download size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-sm dark:text-slate-200">Sauvegarder ma bibliothèque</p>
                            <p className="text-xs text-slate-400">Exporter en fichier JSON</p>
                        </div>
                    </button>

                    <button onClick={() => fileInputRef.current?.click()} className="w-full text-left p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                            <Upload size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-sm dark:text-slate-200">Restaurer une sauvegarde</p>
                            <p className="text-xs text-slate-400">Importer depuis un fichier JSON</p>
                        </div>
                        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
                    </button>

                    <button onClick={handleReset} className="w-full text-left p-4 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                            <Trash2 size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-red-600 dark:text-red-400">Réinitialiser l'application</p>
                            <p className="text-xs text-red-400/70">Attention, suppression définitive</p>
                        </div>
                    </button>
                </div>

                <p className="text-center text-xs text-slate-400 mt-6">BookTracker v1.0.0 • Fait avec ❤️</p>
            </div>

            {/* --- Modals --- */}
            <AnimatePresence>
                {/* Badge Modal */}
                {selectedBadge && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                        onClick={() => setSelectedBadge(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-800 p-8 rounded-3xl max-w-xs w-full text-center shadow-2xl space-y-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className={clsx("w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4", selectedBadge.unlocked ? `bg-${selectedBadge.color}-100 dark:bg-${selectedBadge.color}-900/20` : "bg-slate-100 dark:bg-slate-700")}>
                                <selectedBadge.icon size={48} className={selectedBadge.unlocked ? `text-${selectedBadge.color}-600 dark:text-${selectedBadge.color}-400` : "text-slate-400"} />
                            </div>
                            <h3 className="text-2xl font-bold dark:text-white">{selectedBadge.label}</h3>
                            <p className="text-slate-500 dark:text-slate-300">{selectedBadge.desc}</p>
                            <div className={clsx("inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide", selectedBadge.unlocked ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500")}>
                                {selectedBadge.unlocked ? "Débloqué" : "Verrouillé"}
                            </div>
                            <button onClick={() => setSelectedBadge(null)} className="w-full btn-primary py-3 mt-4">Fermer</button>
                        </motion.div>
                    </motion.div>
                )}

                {/* Edit Profile Modal */}
                {isEditingProfile && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                        onClick={() => setIsEditingProfile(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-800 p-6 rounded-3xl max-w-xs w-full shadow-2xl space-y-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-bold dark:text-white mb-2">Modifier le profil</h3>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">Pseudo</label>
                                <input
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="input-field"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Annuler</button>
                                <button onClick={() => { updateProfile({ name: editName }); setIsEditingProfile(false); }} className="flex-1 btn-primary py-3">Enregistrer</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
