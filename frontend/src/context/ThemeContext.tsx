import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Theme = "dark" | "light";
const KEY = "theme";

function readInitial(): Theme {
    try {
        const saved = localStorage.getItem(KEY);
        if (saved === "light" || saved === "dark") return saved;
    } catch { /*ignore */ }

    return "dark";
}

type ThemeValue = { theme: Theme; setTheme: (t: Theme) => void; toggleTheme: () => void}
const ThemeContext = createContext<ThemeValue | null >(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(readInitial);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        try { localStorage.setItem(KEY, theme) } catch { /* ignore */ };
    }, [theme]);

    useEffect(() => {
        function onStorage(e: StorageEvent) {
            if (e.key === KEY && (e.newValue === "light" || e.newValue === "dark"))
                setTheme(e.newValue)
        }

        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
    const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, toggleTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
    return ctx;
}