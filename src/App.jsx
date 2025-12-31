import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './layout/Layout';
import BookList from './pages/BookList';
import AddBook from './pages/AddBook';
import EditBookPage from './pages/EditBookPage';
import StatsPage from './pages/StatsPage';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import FocusMode from './pages/FocusMode';

// Protected Route Component to check for profile
const RequireProfile = ({ children }) => {
    // Check if profile exists
    const profile = useLiveQuery(() => db.userProfile.toArray());

    // While loading (undefined), show a loader instead of null
    if (profile === undefined) {
        return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" /></div>;
    }

    // If no profile found, redirect to onboarding
    if (profile.length === 0) {
        return <Navigate to="/onboarding" replace />;
    }

    return children;
};

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <Routes>
                    <Route path="/onboarding" element={<Onboarding />} />

                    <Route path="/" element={
                        <RequireProfile>
                            <Layout />
                        </RequireProfile>
                    }>
                        <Route index element={<BookList />} />
                        <Route path="add" element={<AddBook />} />
                        <Route path="edit/:id" element={<EditBookPage />} />
                        <Route path="stats" element={<StatsPage />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="focus" element={<FocusMode />} />
                        {/* Catch all redirect to home */}
                        <Route path="*" element={<BookList />} />
                    </Route>
                </Routes>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
