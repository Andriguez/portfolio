import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../api/client";
import { TRASH_FALLBACK } from "../data/trashFallbacks";
import type { TrashItem } from "../types/trash";

export function useTrash(active: boolean) {
    const [items, setItems] = useState<TrashItem[]>([]);
    const [source, setSource] = useState<"loading" | "github" | "fallback">("loading");
    const started = useRef(false);

    useEffect(() => {
        if (!active || started.current) return;          // only fetched the first time the trash is opened
        started.current = true;
        apiFetch("/api/trash")
            .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
            .then((data: { source: string; items: TrashItem[] }) => {
                if (data.source === "github" && data.items.length > 0) {
                    setItems(data.items);
                    setSource("github");
                } else {
                    setItems(TRASH_FALLBACK);
                    setSource("fallback");
                }
            })
            .catch(() => {
                setItems(TRASH_FALLBACK);
                setSource("fallback");
            });
    }, [active]);

    return { items, source };
}