import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Star, Clock, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import BookSynopsisModal from './BookSynopsisModal';

const BookCard = ({ book, onEdit }) => {
    const navigate = useNavigate();
    const [showSynopsis, setShowSynopsis] = useState(false);
    const { title, author, cover, rating, status, currentPage, pages } = book;

    // Calculate progress percentage
    const progress = book.pages > 0 ? Math.min(100, Math.round((book.currentPage / book.pages) * 100)) : 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onEdit && onEdit(book)}
            className="group relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white dark:bg-slate-800"
        >
            {/* Cover Image */}
            <div className="absolute inset-0">
                {cover ? (
                    <img
                        src={cover}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-100 to-white dark:from-slate-800 dark:to-slate-900 flex flex-col items-center justify-center p-4 text-center">
                        <BookOpen className="w-12 h-12 text-brand-300 mb-3" />
                        <p className="text-sm font-bold text-slate-400 line-clamp-2">{title}</p>
                    </div>
                )}
                {/* Dark Gradient Overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
            </div>

            {/* Content Content (floating on bottom) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                {/* Status Badge and Actions */}
                <div className="flex justify-between items-center mt-2">
                    <span className={clsx(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        book.status === 'reading' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300" :
                            book.status === 'finished' ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300" :
                                "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                    )}>
                        {book.status === 'reading' ? 'En cours' : book.status === 'finished' ? 'Terminé' : 'À lire'}
                    </span>

                    {/* Actions */}
                    <div className="flex gap-2">
                        {/* Synopsis Trigger */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowSynopsis(true); }}
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
                            title="Voir le résumé"
                        >
                            <BookOpen size={16} />
                        </button>

                        {/* Rating */}
                        {book.rating > 0 && (
                            <div className="flex items-center gap-0.5 text-amber-400">
                                <span className="text-xs font-bold">{book.rating}</span>
                                <Star size={12} fill="currentColor" />
                            </div>
                        )}
                    </div>
                </div>

                <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 mb-1 drop-shadow-md">{title}</h3>
                <p className="text-slate-300 text-xs font-medium line-clamp-1 mb-2">{author}</p>

                {/* Progress Bar for Reading Status */}
                {status === 'reading' && (
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full bg-brand-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default BookCard;
