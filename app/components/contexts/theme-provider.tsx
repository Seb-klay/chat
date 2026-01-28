"use client";

import { getUserSettings, updateUserSettings } from "@/app/service";
import { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

type Theme = {
  colors: {
    background: string;
    background_second: string;
    tertiary_background: string;
    primary: string;
    secondary: string;
  };
};

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  toggleTheme: (isDark: boolean) => void;
}

const darkTheme: Theme = {
  colors: {
    background: "#0f172b", // bg-slate-950 #020617 or slate-900 #0f172b
    background_second: "#1e293b", // bg-gray-900 #101828 or slate-800
    tertiary_background: "rgba(30, 64, 175, 0.2)", // bg-blue-900
    primary: "#f3f4f6", // gray-100 for text
    secondary: "#d1d5dc", // gray-300
  },
};

const lightTheme: Theme = {
  colors: {
    background: "#e5e7eb", // gray-200
    background_second: "#cbd5e1", // slate-300
    tertiary_background: "rgba(219, 234, 254, 0.4)", // Lighter blue for selected card
    primary: "#4a5568", // Warm medium-dark gray (gray-700)
    secondary: "#718096", // Warm medium gray (gray-600)
  },
};

const defaultTheme: ThemeContextType = {
  theme: darkTheme,
  mode: "dark",
  toggleTheme: () => {},
};

const ThemeContext = createContext<ThemeContextType>(defaultTheme);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    async function initTheme() {
      try {
        const response = await getUserSettings();
        if (!response) throw new Error("User settings could not be loaded.");
        const { colortheme } = await response.json();
        if (colortheme) setMode(colortheme);
      } catch (err) {
        console.error("Theme load failed", err);
      }
    }
    initTheme();
  }, []);
  
  const toggleTheme = async (newTheme: boolean) => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));

    const updatedTheme = newTheme === true ? "dark" : "light";

    // Update DB in the background
    await updateUserSettings(updatedTheme, null);
  };

  const theme = mode === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
