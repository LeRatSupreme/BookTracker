import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../db';
import { ArrowLeft, Save, Trash2, BookOpen, CheckCircle, Clock, Heart, X, Star } from 'lucide-react';
import clsx from 'clsx';

const EditBookPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [tagInput, setTagInput] = useState('');

    // Load book data
    useEffect(() => {
        if (id) {
            db.books.get(Number(id)).then(data => {
                if (data) {
                    setBook(data);
                } else {
                    alert("Livre introuvable");
                    navigate('/');
                }
                setIsLoading(false);
            });
        }
    }, [id, navigate]);

    // Smart Status Logic
    const handleStatusChange = (newStatus) => {
        let updates = { status: newStatus };
        const now = new Date();

        if (newStatus === 'reading' && book.status === 'tbr') {
            updates.startedDate = now;
        } else if (newStatus === 'finished') {
            updates.finishedDate = now;
            updates.currentPage = book.pages; // Auto-complete
        }

        setBook({ ...book, ...updates });
    };

    const handleUpdate = async () => {
        if (!book) return;

        try {
            await db.books.update(Number(id), {
                ...book,
                pages: Number(book.pages),
                currentPage: Number(book.currentPage),
                updatedDate: new Date()
            });
            navigate('/');
        } catch (error) {
            console.error("Update failed", error);
            alert("Erreur lors de la mise à jour.");
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce livre ? Cette action est irréversible.")) {
            await db.books.delete(Number(id));
            navigate('/');
        }
    };

    const addTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            const currentTags = book.tags ? book.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
            if (!currentTags.includes(tagInput.trim())) {
                const newTags = [...currentTags, tagInput.trim()].join(', ');
                setBook({ ...book, tags: newTags });
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        const currentTags = book.tags ? book.tags.split(',').map(t => t.trim()) : [];
        const newTags = currentTags.filter(t => t !== tagToRemove).join(', ');
        setBook({ ...book, tags: newTags });
    };

    const getStatusChipStyle = (value, activeColor, currentStatus) => {
        const isActive = currentStatus === value;
        const baseStyle = "flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all active:scale-95";

        const colors = {
            slate: {
                active: "border-slate-500 bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 shadow-sm",
                inactive: "border-transparent bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            },
            brand: {
                active: "border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 shadow-sm",
                inactive: "border-transparent bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            },
            green: {
                active: "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 shadow-sm",
                inactive: "border-transparent bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }
        };

        const theme = colors[activeColor] || colors.slate;
        return clsx(baseStyle, isActive ? theme.active : theme.inactive);
    };

    const StatusChip = ({ value, label, icon: Icon, activeColor }) => (
        <button
            onClick={() => handleStatusChange(value)}
            className={getStatusChipStyle(value, activeColor, book.status)}
        >
            <Icon size={20} className="mb-1" />
            <span className="text-xs font-bold">{label}</span>
        </button>
    );

    if (isLoading) return <div className="p-10 text-center animate-pulse">Chargement...</div>;
    if (!book) return null;

    const progressPercent = Math.round((book.currentPage / (book.pages || 1)) * 100);
    const tagsList = book.tags ? book.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    return (
        <div className="pb-48 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-700 dark:text-slate-200">
                    <ArrowLeft size={24} />
                </button>
                <button
                    onClick={() => setBook({ ...book, favorite: !book.favorite })}
                    className={clsx("p-2 rounded-full transition-colors active:scale-110", book.favorite ? "bg-red-50 text-red-500" : "text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800")}
                >
                    <Heart size={24} fill={book.favorite ? "currentColor" : "none"} strokeWidth={book.favorite ? 0 : 2} />
                </button>
            </div>

            {/* Context Header */}
            <div className="flex gap-5 items-start">
                <div className="w-24 aspect-[2/3] rounded-xl shadow-lg border border-white/10 overflow-hidden shrink-0 relative group">
                    {book.cover ? (
                        <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <BookOpen className="text-slate-400" />
                        </div>
                    )}
                </div>
                <div className="flex-1 space-y-3 pt-1">
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Titre</label>
                        <input
                            value={book.title}
                            onChange={e => setBook({ ...book, title: e.target.value })}
                            className="w-full bg-transparent text-xl font-bold border-b border-transparent focus:border-brand-500 focus:outline-none placeholder-slate-400 transition-colors text-slate-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Auteur</label>
                        <input
                            value={book.author}
                            onChange={e => setBook({ ...book, author: e.target.value })}
                            className="w-full bg-transparent text-base font-medium text-slate-600 dark:text-slate-300 border-b border-transparent focus:border-brand-500 focus:outline-none placeholder-slate-400 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Smart Status */}
            <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block ml-1">État de lecture</label>
                <div className="flex gap-2">
                    <StatusChip value="tbr" label="À lire" icon={Clock} activeColor="slate" />
                    <StatusChip value="reading" label="En cours" icon={BookOpen} activeColor="brand" />
                    <StatusChip value="finished" label="Terminé" icon={CheckCircle} activeColor="green" />
                </div>
            </div>

            {/* Interactive Progress */}
            {(book.status === 'reading' || book.status === 'finished') && (
                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 space-y-4">
                    <div className="flex justify-between items-end">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Progression</label>
                        <div className="text-right">
                            <span className="text-2xl font-black text-brand-600 dark:text-brand-400">{progressPercent}%</span>
                        </div>
                    </div>

                    <input
                        type="range"
                        min="0"
                        max={book.pages || 500}
                        value={book.currentPage}
                        onChange={e => setBook({ ...book, currentPage: Number(e.target.value) })}
                        className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-brand-600 dark:accent-brand-500"
                    />

                    <div className="flex items-center justify-between text-sm font-mono text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2">
                        <input
                            type="number"
                            value={book.currentPage}
                            onChange={e => {
                                const val = Number(e.target.value);
                                setBook({ ...book, currentPage: Math.min(val, book.pages) })
                            }}
                            className="w-16 bg-transparent text-right font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                        />
                        <span className="mx-2 opacity-50">/</span>
                        <input
                            type="number"
                            value={book.pages}
                            onChange={e => setBook({ ...book, pages: Number(e.target.value) })}
                            className="w-16 bg-transparent text-left font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                        />
                        <span className="ml-auto text-xs opacity-50 uppercase font-sans">pages</span>
                    </div>
                </div>
            )}

            {/* Critique & Analysis */}
            <div className="space-y-6">
                {/* Rating */}
                <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 mb-2 block">Note</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                onClick={() => setBook({ ...book, rating: star })}
                                className={clsx("p-2 rounded-xl transition-all active:scale-90", book.rating >= star ? "bg-yellow-100 text-yellow-500" : "bg-slate-100 dark:bg-slate-800 text-slate-300")}
                            >
                                <Star size={24} fill={book.rating >= star ? "currentColor" : "none"} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 mb-2 block">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {tagsList.map((tag, i) => (
                            <span key={i} onClick={() => removeTag(tag)} className="px-3 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-lg text-sm font-medium flex items-center gap-1 cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors group">
                                {tag}
                                <X size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                        ))}
                        <input
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={addTag}
                            placeholder="+ Ajouter..."
                            className="bg-transparent text-sm min-w-[80px] outline-none text-slate-500 placeholder-slate-400 py-1"
                        />
                    </div>
                </div>

                {/* Review */}
                <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 mb-2 block">Critique</label>
                    <textarea
                        value={book.review || ''}
                        onChange={e => setBook({ ...book, review: e.target.value })}
                        className="w-full min-h-[120px] p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none text-slate-700 dark:text-slate-300"
                        placeholder="Qu'avez-vous pensé de ce livre ? Style, intrigue, personnages..."
                    />
                </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-8 border-t border-slate-100 dark:border-white/5">
                <button
                    onClick={handleDelete}
                    className="w-full py-4 flex items-center justify-center gap-2 text-red-500/70 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all text-sm font-medium"
                >
                    <Trash2 size={16} />
                    Supprimer ce livre
                </button>
            </div>

            {/* Sticky Save Button */}
            <div className="fixed bottom-24 left-0 right-0 p-4 pointer-events-none flex justify-center z-30">
                <button
                    onClick={handleUpdate}
                    className="pointer-events-auto shadow-2xl shadow-brand-500/50 btn-primary w-full max-w-[200px] py-3 text-sm font-bold rounded-full scale-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center backdrop-blur-md bg-brand-600/90 text-white"
                >
                    <Save size={18} className="mr-2" />
                    Sauvegarder
                </button>
            </div>
        </div>
    );
};

export default EditBookPage;
