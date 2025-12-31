import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Sparkles, WifiOff, X, BookOpen, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import clsx from 'clsx';
import BookSynopsisModal from './BookSynopsisModal';

const RecommendationEngine = () => {
    const isOnline = useOnlineStatus();
    const [isOpen, setIsOpen] = useState(false);
    const [showSynopsis, setShowSynopsis] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [recommendation, setRecommendation] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const library = useLiveQuery(() => db.books.toArray());

    const generateRecommendation = async () => {
        setIsLoading(true);
        setErrorMsg('');
        setRecommendation(null);
        setIsOpen(true);

        try {
            // 1. Analyze Local Tastes (Finished & Rated >= 4)
            const favorites = await db.books
                .where('status').equals('finished')
                .filter(b => b.rating >= 4)
                .toArray();

            if (favorites.length < 3) {
                setErrorMsg("Lis et note encore quelques livres (min. 3 coups de cœur) pour que je puisse cibler tes goûts !");
                setIsLoading(false);
                return;
            }

            // Extract Authors frequency
            const authorCounts = {};
            favorites.forEach(book => {
                const author = book.author.trim();
                authorCounts[author] = (authorCounts[author] || 0) + 1;
            });

            // Find top author
            const topAuthor = Object.keys(authorCounts).reduce((a, b) => authorCounts[a] > authorCounts[b] ? a : b);

            // 2. Query Google Books API
            // We look for books by this author or similar subject
            const query = `inauthor:${encodeURIComponent(topAuthor)}`;
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=20&langRestrict=fr&key=`);
            const data = await response.json();

            if (!data.items) {
                setErrorMsg("Aucune recommandation trouvée pour le moment.");
                setIsLoading(false);
                return;
            }

            // 3. Filter Duplicates (Already in Library)
            const libraryIsbns = new Set(library.map(b => b.isbn).filter(Boolean)); // Assuming we saved ISBN, or just title check
            const libraryTitles = new Set(library.map(b => b.title.toLowerCase()));

            const candidates = data.items.filter(item => {
                const title = item.volumeInfo.title.toLowerCase();
                // Simple title matching to avoid adding what we have
                return !libraryTitles.has(title);
            });

            if (candidates.length === 0) {
                setErrorMsg(`Tu as déjà lu tout ce qui est populaire de ${topAuthor} ! Impressionnant.`);
                setIsLoading(false);
                return;
            }

            // Pick a random one from top 5 candidates to vary
            const winner = candidates[Math.floor(Math.random() * Math.min(candidates.length, 5))];

            setRecommendation({
                title: winner.volumeInfo.title,
                author: winner.volumeInfo.authors ? winner.volumeInfo.authors[0] : 'Inconnu',
                cover: winner.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
                description: winner.volumeInfo.description,
                pages: winner.volumeInfo.pageCount,
                googleId: winner.id
            });

        } catch (err) {
            console.error(err);
            setErrorMsg("Erreur de connexion au cerveau cosmique.");
        } finally {
            setIsLoading(false);
        }
    };

    const addToLibrary = async () => {
        if (!recommendation) return;

        await db.books.add({
            title: recommendation.title,
            author: recommendation.author,
            cover: recommendation.cover,
            pages: recommendation.pages,
            status: 'tbr',
            addedDate: new Date(),
            rating: 0
        });

        setIsOpen(false);
        alert(`${recommendation.title} a été ajouté à ta Pile à Lire !`);
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={generateRecommendation}
                disabled={!isOnline}
                className={clsx(
                    "w-full relative overflow-hidden group p-1 rounded-2xl transition-all active:scale-95",
                    !isOnline && "opacity-50 cursor-not-allowed grayscale"
                )}
            >
                <div className="relative z-10 bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-500 dark:to-indigo-500 text-white p-4 rounded-xl flex items-center justify-between shadow-lg group-hover:shadow-indigo-500/25 transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            {isOnline ? <Sparkles size={20} className="animate-pulse" /> : <WifiOff size={20} />}
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-sm">Suggère-moi un livre</p>
                            <p className="text-[10px] opacity-80">{isOnline ? "Basé sur tes lectures favorites" : "Pas de connexion internet"}</p>
                        </div>
                    </div>
                </div>
                {/* Shimmer Effect */}
                {isOnline && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shimmer z-20" />}
            </button>

            {/* Magic Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.8, y: 50, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative"
                        >
                            {/* Close Button */}
                            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors">
                                <X size={20} />
                            </button>

                            {isLoading ? (
                                <div className="h-96 flex flex-col items-center justify-center text-center p-8 space-y-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full border-4 border-violet-200 dark:border-violet-900 border-t-violet-600 animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles size={24} className="text-violet-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Analyse de vos goûts...</h3>
                                        <p className="text-sm text-slate-500">Recherche dans la base de données universelle</p>
                                    </div>
                                </div>
                            ) : errorMsg ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-2">
                                        <BookOpen size={32} className="text-slate-400" />
                                    </div>
                                    <p className="font-bold text-slate-700 dark:text-slate-300">{errorMsg}</p>
                                    <button onClick={() => setIsOpen(false)} className="px-6 py-2 bg-slate-200 dark:bg-slate-700 rounded-full font-bold text-sm text-slate-600 dark:text-slate-300">Fermer</button>
                                </div>
                            ) : recommendation && (
                                <>
                                    {/* Cover Image */}
                                    <div className="h-64 bg-slate-900 relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
                                        {recommendation.cover ? (
                                            <img src={recommendation.cover} alt={recommendation.title} className="w-full h-full object-cover opacity-80" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                                <BookOpen size={48} className="text-slate-600" />
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                                            <span className="bg-violet-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">Recommandé pour vous</span>
                                            <h2 className="text-2xl font-black text-white leading-tight mb-1 shadow-black drop-shadow-md">{recommendation.title}</h2>
                                            <p className="text-slate-300 font-medium">{recommendation.author}</p>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-4">
                                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed">
                                            {recommendation.description || "Aucun résumé disponible."}
                                        </p>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setShowSynopsis(true)}
                                                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <BookOpen size={20} />
                                                Résumé
                                            </button>
                                            <button
                                                onClick={addToLibrary}
                                                className="flex-[2] py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                                            >
                                                <Plus size={20} />
                                                Ajouter
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BookSynopsisModal
                isOpen={showSynopsis}
                onClose={() => setShowSynopsis(false)}
                book={recommendation}
            />
        </>
    );
};

export default RecommendationEngine;
