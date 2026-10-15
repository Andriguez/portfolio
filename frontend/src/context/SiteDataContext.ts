import { createContext, useContext } from "react";
import type { SiteData } from "../hooks/useSiteData";

type Value = { data: SiteData; loaded: boolean };
export const SiteDataContext = createContext<Value | null>(null);

export function useSite() {
    const ctx = useContext(SiteDataContext);
    if (!ctx) throw new Error("useSite must be used inside Context.")
    return ctx
}