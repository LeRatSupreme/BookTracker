import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const themes = {
    blue: {
        50: '239 246 255', 100: '219 234 254', 200: '191 219 254', 300: '147 197 253', 400: '96 165 250',
        500: '59 130 246', 600: '37 99 235', 700: '29 78 216', 800: '30 64 175', 900: '30 58 138'
    },
    purple: {
        50: '250 245 255', 100: '243 232 255', 200: '233 213 255', 300: '216 180 254', 400: '192 132 252',
        500: '168 85 247', 600: '147 51 234', 700: '126 34 206', 800: '107 33 168', 900: '88 28 135'
    },
    green: {
        50: '236 253 245', 100: '209 250 229', 200: '167 243 208', 300: '110 231 183', 400: '52 211 153',
        500: '16 185 129', 600: '5 150 105', 700: '4 120 87', 800: '6 95 70', 900: '6 78 59'
    },
    orange: {
        50: '255 247 237', 100: '255 237 213', 200: '254 215 170', 300: '253 186 116', 400: '251 146 60',
        500: '249 115 22', 600: '234 88 12', 700: '194 65 12', 800: '154 52 18', 900: '124 45 18'
    }
};

export const ThemeProvider = ({ children }) => {
    const profile = useLiveQuery(() => db.userProfile.toArray());
    const [currentTheme, setCurrentTheme] = useState('blue');

    useEffect(() => {
        if (profile && profile.length > 0) {
            const themeName = profile[0].theme || 'blue';
            setCurrentTheme(themeName);

            const colors = themes[themeName] || themes.blue;
            const root = document.documentElement;

            // Apply CSS Variables
            Object.entries(colors).forEach(([shade, value]) => {
                root.style.setProperty(`--color-brand-${shade}`, value);
            });

            // Apply Mode (Light/Dark)
            if (profile[0].mode === 'light') {
                root.classList.remove('dark');
            } else {
                root.classList.add('dark');
            }
        }
    }, [profile]);

    return (
        <ThemeContext.Provider value={{ theme: currentTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
