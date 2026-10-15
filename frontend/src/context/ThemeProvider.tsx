import { useEffect, useCallback, useMemo, useState, type ReactNode } from "react";
import { readInitial, type Theme, KEY, ThemeContext } from "./ThemeContext";

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