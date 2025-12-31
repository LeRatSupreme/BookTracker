import React from 'react';
import { X, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BookSynopsisModal = ({ isOpen, onClose, book }) => {
    if (!isOpen || !book) return null;

    // Basic HTML stripper (Lightweight alternative to DOMPurify for this specific use case)
    // We replace <br> with newlines and then strip other tags
    const cleanDescription = (html) => {
        if (!html) return null;
        let text = html.replace(/<br\s*\/?>/gi, '\n');
        text = text.replace(/<p>/gi, '\n\n');
        text = text.replace(/<\/?[^>]+(>|$)/g, ""); // Strip remaining tags
        // Decode common entities
        const doc = new DOMParser().parseFromString(text, "text/html");
        return doc.documentElement.textContent;
    };

    const description = cleanDescription(book.description) || "Aucun résumé disponible pour ce livre. C'est le moment de se laisser surprendre !";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 z-10 flex justify-between items-start gap-4">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-brand-500 tracking-wider">Synopsis</span>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mt-1 line-clamp-2">
                                    {book.title}
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="p-6 pt-4 overflow-y-auto custom-scrollbar">
                            {book.description ? (
                                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed whitespace-pre-line text-justify font-serif">
                                    {description}
                                </p>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-center space-y-4">
                                    <BookOpen size={48} className="opacity-50" />
                                    <p className="italic">{description}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer (Optional) */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 text-center">
                            <button onClick={onClose} className="text-sm font-bold text-brand-600 hover:text-brand-700">
                                Fermer
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BookSynopsisModal;
