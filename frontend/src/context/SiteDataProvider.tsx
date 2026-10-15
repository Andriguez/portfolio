import { useMemo, type ReactNode } from "react";
import { useSiteData } from "../hooks/useSiteData";
import { SiteDataContext } from "./SiteDataContext"

export function SiteDataProvider({children}: { children: ReactNode }) {
    const { data, loaded } = useSiteData();
    const value = useMemo(() => ({ data, loaded }), [data, loaded]);
    return <SiteDataContext.Provider value={value}>
        {children}
    </SiteDataContext.Provider>
}