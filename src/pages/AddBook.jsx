import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../db';
import { Search, Plus, Save, X, Book } from 'lucide-react';

const AddBook = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID from URL if editing
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [startIndex, setStartIndex] = useState(0); // For pagination
    const [selectedBook, setSelectedBook] = useState(null);

    // Manual form state
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        pages: '',
        cover: '',
        status: 'tbr', // tbr, reading, finished
        rating: 0,
        currentPage: 0,
        tags: '',
        review: ''
    });

    // Load book data if editing
    React.useEffect(() => {
        if (id) {
            db.books.get(Number(id)).then(book => {
                if (book) {
                    setFormData(book);
                    setSelectedBook(true);
                }
            });
        }
    }, [id]);

    const searchBooks = async (e, loadMore = false) => {
        if (e) e.preventDefault();
        // If loading more, don't clear results. If new search, clear results and reset startIndex
        const newStartIndex = loadMore ? startIndex + 15 : 0;
        if (!loadMore) {
            if (!query) return;
            setResults([]);
            setStartIndex(0);
        }

        setIsSearching(true);
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&startIndex=${newStartIndex}&maxResults=15`);

            const data = await response.json();
            const newItems = data.items || [];

            setResults(prev => loadMore ? [...prev, ...newItems] : newItems);
            setStartIndex(newStartIndex);
        } catch (error) {
            console.error("Failed to fetch books", error);
        } finally {
            setIsSearching(false);
        }
    };

    const selectBook = (item) => {
        const info = item.volumeInfo;
        setFormData({
            title: info.title || '',
            author: info.authors ? info.authors.join(', ') : 'Unknown Author',
            pages: info.pageCount || 0,
            cover: info.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
            status: 'tbr',
            rating: 0,
            currentPage: 0,
            tags: info.categories ? info.categories.join(', ') : '',
            review: ''
        });
        setSelectedBook(true);
        setResults([]);
    };

    const handleSave = async () => {
        try {
            const bookData = {
                ...formData,
                pages: Number(formData.pages),
                currentPage: Number(formData.currentPage),
                finishedDate: formData.status === 'finished' ? new Date() : null
            };

            if (id) {
                // Update existing
                await db.books.update(Number(id), bookData);
            } else {
                // Add new
                await db.books.add({
                    ...bookData,
                    addedDate: new Date()
                });
            }
            navigate('/');
        } catch (error) {
            alert("Erreur lors de la sauvegarde : " + error);
        }
    };

    return (
        <div className="space-y-6 pb-20">

            {!selectedBook ? (
                // Search Mode
                <div className="space-y-6">
                    <h2 className="text-xl font-bold p-1">Ajouter un livre</h2>

                    <form onSubmit={searchBooks} className="relative">
                        <input
                            type="text"
                            placeholder="Titre, Auteur, ISBN..."
                            className="input-field pr-12"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-100 dark:bg-slate-700 rounded-lg text-brand-600 dark:text-brand-400"
                            disabled={isSearching}
                        >
                            {isSearching ? <div className="animate-spin text-xs">⏳</div> : <Search size={20} />}
                        </button>
                    </form>

                    <div className="space-y-3">
                        {results.map(item => (
                            <div
                                key={item.id}
                                onClick={() => selectBook(item)}
                                className="flex gap-4 p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 active:scale-98 transition-transform cursor-pointer"
                            >
                                {item.volumeInfo.imageLinks?.thumbnail ? (
                                    <img src={item.volumeInfo.imageLinks.thumbnail} alt="" className="w-16 h-24 object-cover rounded shadow" />
                                ) : (
                                    <div className="w-16 h-24 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                                        <Book className="text-slate-400" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm line-clamp-2">{item.volumeInfo.title}</h3>
                                    <p className="text-xs text-slate-500">{item.volumeInfo.authors?.join(', ')}</p>
                                    <p className="text-xs text-slate-400 mt-1">{item.volumeInfo.pageCount ? `${item.volumeInfo.pageCount} pages` : ''}</p>
                                </div>
                                <button className="self-center p-2 bg-brand-50 text-brand-600 rounded-full">
                                    <Plus size={20} />
                                </button>
                            </div>
                        ))}

                        {/* Load More Button */}
                        {results.length > 0 && (
                            <button
                                onClick={() => searchBooks(null, true)}
                                className="w-full py-2 text-center text-sm font-medium text-slate-500 hover:text-brand-600 mb-4"
                                disabled={isSearching}
                            >
                                {isSearching ? 'Chargement...' : 'Charger plus de résultats'}
                            </button>
                        )}

                        {/* Manual Add Trigger */}
                        {results.length > 0 && query.length > 2 && (
                            <button
                                onClick={() => { setSelectedBook(true); setResults([]); }}
                                className="w-full py-4 text-center text-brand-600 font-medium bg-brand-50 rounded-xl"
                            >
                                Ajouter manuellement "{query}" (ou livre introuvable)
                            </button>
                        )}

                        {results.length === 0 && query.length > 2 && !isSearching && (
                            <button
                                onClick={() => { setSelectedBook(true); setResults([]); }}
                                className="w-full py-4 text-center text-brand-600 font-medium bg-brand-50 rounded-xl"
                            >
                                Ajouter manuellement "{query}"
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                // Edit Mode
                <div className="space-y-4 animate-slide-up">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Détails du livre</h2>
                        <button onClick={() => setSelectedBook(null)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex gap-4 items-start">
                        {formData.cover ? (
                            <img src={formData.cover} alt="Cover" className="w-24 rounded-lg shadow-lg" />
                        ) : (
                            <div className="w-24 h-36 bg-slate-200 rounded-lg flex items-center justify-center">No Cover</div>
                        )}
                        <div className="flex-1 space-y-2">
                            <input
                                className="input-field font-bold"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Titre"
                            />
                            <input
                                className="input-field text-sm"
                                value={formData.author}
                                onChange={e => setFormData({ ...formData, author: e.target.value })}
                                placeholder="Auteur"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold ml-1 text-slate-500">Pages</label>
                            <input
                                type="number"
                                className="input-field"
                                value={formData.pages}
                                onChange={e => setFormData({ ...formData, pages: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold ml-1 text-slate-500">Status</label>
                            <select
                                className="input-field"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="tbr">Pile à lire</option>
                                <option value="reading">En cours</option>
                                <option value="finished">Terminé</option>
                            </select>
                        </div>
                    </div>

                    {formData.status === 'reading' && (
                        <div>
                            <label className="text-xs font-bold ml-1 text-slate-500">
                                Progression (Page {formData.currentPage} / {formData.pages})
                            </label>
                            <input
                                type="range"
                                min="0"
                                max={formData.pages || 100}
                                value={formData.currentPage}
                                onChange={e => setFormData({ ...formData, currentPage: e.target.value })}
                                className="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2"
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold ml-1 text-slate-500">Tags</label>
                        <input
                            className="input-field"
                            placeholder="Fiction, Thriller, Coup de cœur..."
                            value={formData.tags}
                            onChange={e => setFormData({ ...formData, tags: e.target.value })}
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full btn-primary mt-4"
                    >
                        <Save size={20} />
                        Enregistrer dans ma bibliothèque
                    </button>
                </div>
            )}

        </div>
    );
};

export default AddBook;
