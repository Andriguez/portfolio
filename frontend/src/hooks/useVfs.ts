import { useLocation, useNavigate } from "react-router-dom";
import type { VfsNode, VfsFolder } from "../types/vfs";
import { fetchVfsTree } from "../api/vfs.ts";
import { useEffect, useState } from "react";

export const CV_PLACE = "my_cv";
const PLACES = [CV_PLACE] as const;
export type Place = (typeof PLACES)[number];


function findNode(current: VfsFolder, pathParts: string[]): VfsNode | null {
    if (pathParts.length === 0) return current;
    const [next, ...rest] = pathParts;
    const child = current.children.find((c) => c.slug === next);
    if (!child) return null;
    if (child.type === "file") return rest.length === 0 ? child : null;
    return findNode(child, rest);
}

function resolvePath(root: VfsFolder, base: string[], target: string): string[] | null {
    const isAbsolute = target.startsWith("/") || target.startsWith("~") || target.startsWith("home");
    const segments = target.split("/").filter((s) => s.length > 0 && s !== "~" && s!= "home");
    let working = isAbsolute ? [] : [...base];

    for (const seg of segments) {
        if (seg === ".") continue;
        if (seg === ".." || seg === "back") { working = working.slice(0, -1); continue; }

        const node = findNode(root, working); // <- uses the passed-in root now
        if (!node || node.type !== "folder") return null;

        const child = node.children.find((c) => c.slug === seg && c.type === "folder");
        if (!child) return null;

        working = [...working, seg];
    }
    return working;
}

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
        return currentFolder.children.find((c) => c.slug === target && c.type === "file") ?? null;
    }

    function getFolder(path: string[]): VfsFolder | null {
        if (!root) return null;
        const node = findNode(root, path);
        return node?.type === "folder" ? node : null;
    }

    function cd(target: string): VfsFolder | null {
        if (!root) return null;
        const resolved = resolvePath(root, pathParts, target);
        if (!resolved) return null;
        const folder = getFolder(resolved);
        if (!folder) return null;
        navigate("/" + resolved.join("/"));
        return folder;
    }

    function goToPath(parts: string[]) { navigate("/" + parts.join("/")); }
    function goToPlace(p: Place) { navigate("/" + p); }

    useEffect(() => {
        if (unknownLocation) {
            navigate({ pathname: "/", search: location.search}, { replace: true });
        }
    });


    return { 
        root, loading, error,
        currentFolder, currentPath: "/" + pathParts.join("/"),
        displayPath: place ? "/" + place : "/" + pathParts.join("/"),
        pathParts, place, cd, goToPath, 
        goToPlace, resolveFile, getFolder,
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