'use client'

import { createContext, useContext, useState } from "react";

type ThemeMode = 'dark' | 'light';

type Theme = {
    colors: {
        background: string;
        background_second: string;
        tertiary_background: string;
        card_bg: string;
        foreground: string,
        primary: string;
        secondary: string;
        tertiary: string;
    }
};

interface ThemeContextType {
    theme: Theme;
    mode: ThemeMode;
    toggleTheme: () => void;
}

const darkTheme: Theme = {
    colors: {
        background: "#0f172b", // bg-slate-950 #020617 or slate-900 #0f172b
        background_second: "#1e293b", // bg-gray-900 #101828 or slate-800 
        tertiary_background: "rgba(30, 64, 175, 0.2)", // bg-blue-900/20
        card_bg: "rgba(30, 41, 59, 0.7)", // bg-slate-800/70 #1d293d
        foreground: "#ededed",
        primary: "#f3f4f6", // gray-100 for text
        secondary: "#d1d5dc", // gray-300
        tertiary: "#ff0000" // red for testing purpose
    }
};

const lightTheme: Theme = {
    colors: {
        background: "#e5e7eb", // gray-200
        background_second: "#cbd5e1", // slate-300
        tertiary_background: "rgba(219, 234, 254, 0.4)", // Lighter blue for selected card
        card_bg: "#cbd5e1", // slate-300
        foreground: "#2d3748", // Warm dark gray (gray-800)
        primary: "#4a5568", // Warm medium-dark gray (gray-700)
        secondary: "#718096", // Warm medium gray (gray-600)
        tertiary: "#c05621" // Terracotta - warm but muted
    }
};

const defaultTheme: ThemeContextType = {
    theme: darkTheme,
    mode: "dark",
    toggleTheme: () => {}
};

const ThemeContext = createContext<ThemeContextType>(defaultTheme);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [mode, setMode] = useState<ThemeMode>('dark');

    const toggleTheme = () => {
        setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const theme = mode === 'dark' ? darkTheme : lightTheme;
    
    return(
        <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
            { children }
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);