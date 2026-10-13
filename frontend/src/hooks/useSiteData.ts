import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

export type SiteData = {
    staticContent: { hello_message: string; stack_info: string };
    links: { id: number; name: string; url: string }[];
    cvs: { 
        id: number;
        type: string;
        name: string;
        size: number;
        downloads: number;
        uploaded_at: string;
    }[];
};

const EMPTY: SiteData = { staticContent: { hello_message: "", stack_info: "" }, links: [], cvs: [] };

const getJson = (path: string) =>
    apiFetch(path).then((r) => { if (!r.ok) throw new Error(path); return r.json(); });

export function useSiteData() {
    const [data, setData] = useState<SiteData>(EMPTY);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        Promise.all([getJson("/api/static_content"), getJson("/api/links"), getJson("/api/cv")])
            .then(([staticContent, links, cvs]) => setData({ staticContent, links, cvs }))
            .catch(() => {})
            .finally(() => setLoaded(true));
    }, []);

    return { data, loaded };
}