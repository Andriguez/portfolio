import { createContext, useContext } from "react";

export type Theme = "dark" | "light";
export const KEY = "theme";

export function readInitial(): Theme {
    try {
        const saved = localStorage.getItem(KEY);
        if (saved === "light" || saved === "dark") return saved;
    } catch { /*ignore */ }

    return "dark";
}

type ThemeValue = { theme: Theme; setTheme: (t: Theme) => void; toggleTheme: () => void}
export const ThemeContext = createContext<ThemeValue | null >(null);

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
    return ctx;
}