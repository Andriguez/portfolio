import { useLocation, useNavigate } from "react-router-dom";
import type { VfsNode, VfsFolder } from "../types/vfs";
import { fetchVfsTree } from "../api/vfs.ts";
import { useEffect, useState } from "react";
import { apiFetch } from "../api/client.ts";
import { findNode, resolvePath } from "../helpers/vfsPath.ts";

export const CV_PLACE = "my_cv";
export const TRASH_PLACE = "trash";

const PLACES = [CV_PLACE, TRASH_PLACE] as const;
export type Place = (typeof PLACES)[number];



export function useVfs() {
    const [root, setRoot] = useState<VfsFolder | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;
        fetchVfsTree()
            .then((tree) => { if (!cancelled) setRoot(tree); })
            .catch((err) => { if (!cancelled) setError(err.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const rawParts = location.pathname.split("/").filter(Boolean);
    const place = rawParts.length === 1 ? (PLACES.find((p) => p === rawParts[0]) ?? null) : null
    const pathParts = place ? [] : rawParts;

    const found = root && !place ? findNode(root, pathParts) : null
    const pathIsValid = found?.type === "folder";
    const currentFolder = root ? (pathIsValid ? (found as VfsFolder): root) : null;
    const unknownLocation = !!root && !place && !pathIsValid;

    function resolveFile(target: string) {
        if (!currentFolder) return null;
        return currentFolder.children.find((c) => (c.slug === target || c.name === target) && c.type === "file") ?? null;
    }

    function getFolder(path: string[]): VfsFolder | null {
        if (!root) return null;
        const node = findNode(root, path);
        return node?.type === "folder" ? node : null;
    }

    function resolveTarget(target: string): { parts: string[]; folder: VfsFolder } | null {
        if (!root) return null;

        const parts = resolvePath(root, pathParts, target);
        if (!parts) return null;

        const folder = getFolder(parts);
        return folder ? { parts, folder } : null;
    }

    function resolveFolder(target: string): VfsFolder | null {
        return resolveTarget(target)?.folder ?? null;
    }

    function cd(target: string): VfsFolder | null {
        const resolved = resolveTarget(target);
        if (!resolved) return null;

        navigate("/" + resolved.parts.join("/"));
        return resolved.folder;
    }

    function goToPath(parts: string[]) { navigate("/" + parts.join("/")); }
    function goToPlace(p: Place) { navigate("/" + p); }

    useEffect(() => {
        if (unknownLocation) {
            navigate({ pathname: "/", search: location.search}, { replace: true });
        }
    });

    function setOpen(slug: string | null) {
        const params = new URLSearchParams(location.search);
        if (slug) params.set("open", slug);
        else params.delete("open");
        const search = params.toString();
        navigate({ pathname: location.pathname, search: search ? `?${search}` : "" }, { replace: true });
    }


    return { 
        root, loading, error,
        currentFolder, currentPath: "/" + pathParts.join("/"),
        displayPath: place ? "/" + place : "/" + pathParts.join("/"),
        resolveFolder, pathParts, place, cd, goToPath, 
        goToPlace, resolveFile, getFolder, setOpen
    };
}

export function searchVfs(root: VfsFolder, query: string): { node: VfsNode; path: string[] }[] {
    if (!query) return [];
    const results: { node: VfsNode; path: string[] }[] = [];
    function walk(folder: VfsFolder, pathSoFar: string[]) {
        for (const child of folder.children) {
            if (child.name.toLowerCase().includes(query.toLowerCase())) {
                results.push({ node: child, path: [...pathSoFar, child.slug] });
            }
            if (child.type === "folder") walk(child, [...pathSoFar, child.slug]);
        }
    }
    walk(root, []);
    return results;
}

type NodeContent = { title?: string; body?: string; image?: string };
type BodyState =
    | { status: "loading" }
    | { status: "error" }
    | ({ status: "ready" } & NodeContent);

const cache = new Map<number, NodeContent>();
type Fetched = { id: number; state: BodyState };

export function useNodeBody(id: number): BodyState {
    const [fetched, setFetched] = useState<Fetched | null>(null);

    useEffect(() => {
        if (cache.has(id)) return;

        let cancelled = false;
        apiFetch(`/api/vfs/${id}`)
            .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
            .then((data) => {
                const content: NodeContent = {
                    title: data.title ?? undefined,
                    body: data.body ?? undefined,
                    image: data.image ?? undefined,
                };
                cache.set(id, content);
                if (!cancelled) setFetched({ id, state: { status: "ready", ...content } });
            })
            .catch(() => { if (!cancelled) setFetched({ id, state: { status: "error" } }); });

        return () => { cancelled = true; };
    }, [id]);

    const cached = cache.get(id);
    if (cached) return { status: "ready", ...cached };
    if (fetched?.id === id) return fetched.state;
    return { status: "loading" };
}