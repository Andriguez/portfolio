import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useSiteData, type SiteData } from "../hooks/useSiteData";

type Value = { data: SiteData; loaded: boolean };
const SiteDataContext = createContext<Value | null>(null);

export function SiteDataProvider({children}: { children: ReactNode }) {
    const { data, loaded } = useSiteData();
    const value = useMemo(() => ({ data, loaded }), [data, loaded]);
    return <SiteDataContext.Provider value={value}>
        {children}
    </SiteDataContext.Provider>
}

export function useSite() {
    const ctx = useContext(SiteDataContext);
    if (!ctx) throw new Error("useSite must be used inside Context.")
    return ctx
}