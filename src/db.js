import Dexie from 'dexie';

export const db = new Dexie('BookTrackerDB');

// Version 1: Initial schema
db.version(1).stores({
    books: '++id, title, author, status, rating, addedDate'
});

// Version 2: Premium features
db.version(2).stores({
    books: '++id, title, author, status, rating, addedDate',
    userProfile: '++id', // Singleton for user profile
    readingSessions: '++id, bookId, date' // For stats
});

// Helper to seed or check data
db.on('populate', () => {
    // Optional: Add default data if needed
});
