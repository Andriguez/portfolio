import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import type { Changelog } from "../helpers/changelogToNode";

export type SiteData = {
    staticContent: { hello_message: string; stack_info: string };
    links: { id: number; name: string; url: string }[];
    cvs: { 
        id: number;
        type: string;
        filename: string;
        size: number;
        download_count: number;
        uploaded_at: string;
    }[];
    changelog: Changelog
};

const EMPTY: SiteData = { staticContent: { hello_message: "", stack_info: "" }, links: [], cvs: [], changelog: { status: "empty", content: {body: "", title: ""}, updated_at: "", description: "" } };

const getJson = (path: string) =>
    apiFetch(path).then((r) => { if (!r.ok) throw new Error(path); return r.json(); });

export function useSiteData() {
    const [data, setData] = useState<SiteData>(EMPTY);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        Promise.all([getJson("/api/static_content"), getJson("/api/links"), getJson("/api/cv"), getJson("/api/changelog")])
            .then(([staticContent, links, cvs, changelog]) => setData({ staticContent, links, cvs, changelog }))
            .catch(() => {})
            .finally(() => setLoaded(true));
    }, []);

    return { data, loaded };
}