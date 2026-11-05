import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useVfs } from "./useVfs";
import type { VfsFile } from "../types/vfs";

export function useOpenFile(vfs:  ReturnType<typeof useVfs>, placeNodes: VfsFile[] | null) {
    const [searchParams, setSearchParams] = useSearchParams();    

    const openSlug = searchParams.get("open");
    const openFile = openSlug
        ? ((placeNodes ? placeNodes.find((n) => n.slug === openSlug) : vfs.resolveFile(openSlug)) ?? null)
        : null;

    function open(slug: string) { 
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set("open", slug);
                return next;
            });
        }
    
        const close = useCallback(() => {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.delete("open");
                return next;
            }, { replace: true });
        }, [setSearchParams]);
    
    useEffect(() => {
        if (!openFile) return;
            function handleKey(e: KeyboardEvent) {
                if (e.key === "Escape") close();
        }
            window.addEventListener("keydown", handleKey);
            return () => window.removeEventListener("keydown", handleKey);
    }, [openFile, close]);

    return { open, openFile, close, openSlug }
        
}