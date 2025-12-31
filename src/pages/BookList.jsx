import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import BookCard from '../components/BookCard';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookList = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('reading');
    const [searchQuery, setSearchQuery] = useState('');

    const books = useLiveQuery(
        () => {
            let collection = db.books.orderBy('addedDate').reverse();

            // Filter by status depending on tab
            if (activeTab === 'reading') {
                return collection.filter(book => book.status === 'reading').toArray();
            } else if (activeTab === 'tbr') {
                return collection.filter(book => book.status === 'tbr').toArray();
            } else if (activeTab === 'finished') {
                return collection.filter(book => book.status === 'finished').toArray();
            }
            return collection.toArray();
        },
        [activeTab]
    );

    // Client-side search filtering
    const filteredBooks = books?.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = useLiveQuery(async () => {
        const reading = await db.books.where('status').equals('reading').count();
        const tbr = await db.books.where('status').equals('tbr').count();
        const finished = await db.books.where('status').equals('finished').count();
        return { reading, tbr, finished };
    });

    const handleEditBook = (book) => {
        navigate(`/edit/${book.id}`);
    };

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Chercher dans ma bibliothèque..."
                    className="input-field pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl">
                {['reading', 'tbr', 'finished'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab
                            ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                            }`}
                    >
                        {tab === 'reading' && 'En cours'}
                        {tab === 'tbr' && 'Pile à lire'}
                        {tab === 'finished' && 'Terminés'}

                        {/* Badge Count */}
                        {stats && stats[tab] > 0 && (
                            <span className="ml-1.5 bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-300 py-0.5 px-1.5 rounded-full text-[9px]">
                                {stats[tab]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-20">
                {filteredBooks?.map(book => (
                    <BookCard key={book.id} book={book} onEdit={handleEditBook} />
                ))}

                {filteredBooks?.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 flex flex-col items-center">
                        <p>Aucun livre trouvé dans cette liste.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookList;
