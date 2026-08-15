import { useLocation, useNavigate } from "react-router-dom";
import type { VfsNode, VfsFolder, VfsFile } from "../types/vfs";
import { root } from "../data/vfs";

function findNode(current: VfsFolder, pathParts: string[]): VfsNode | null {
    if (pathParts.length === 0) return current;

    const [next, ...rest] = pathParts;
    const child = current.children.find((c) => c.slug === next);

    if (!child) return null;

    if (child.type === "file") return rest.length === 0 ? child : null;

    return findNode(child, rest);
}

function resolvePath(base: string[], target: string): string[] | null {
    const isAbsolute = target.startsWith("/") || target.startsWith("~") || target.startsWith("home");
    const segments = target
        .split("/")
        .filter((s) => s.length > 0 && s !== "~");

    let working = isAbsolute ? [] : [...base];

    for (const seg of segments) {
        if (seg === ".") continue;

        if (seg === ".." || seg === "back") {
            working = working.slice(0, -1);
            continue;
        }

        const node = findNode(root as VfsFolder, working);
        if (!node || node.type !== "folder") return null;

        const child = node.children.find(
            (c) => c.slug === seg && c.type === "folder"
        );

        if (!child) return null;

        working = [...working, seg];
    }

    return working;
}


export function useVfs() {
    const location = useLocation();
    const navigate = useNavigate();
    const pathParts = location.pathname.split("/").filter(Boolean);

    const currentFolder =
        (findNode(root as VfsFolder, pathParts) ?? root) as VfsFolder;


    function getFolder(path: string[]): VfsFolder | null {
        const node = findNode(root as VfsFolder, path);
        return node?.type === "folder" ? node : null;
    }

    function cd(target: string): VfsFolder | null {
        const resolved = resolvePath(pathParts, target);
        if (!resolved) return null;

        const folder = getFolder(resolved);
        if (!folder) return null;

        navigate("/"+resolved.join("/"));

        return folder;
    }

    function goToPath(parts: string[]) {
        navigate("/"+parts.join("/"));
    }

    function resolveFile(target: string): VfsFile | null {
        const found = currentFolder.children.find(
            (c): c is VfsFile => c.type === "file" && c.slug === target
        );

        return found ?? null;
    }

    return {
        currentFolder,
        currentPath: "/" + pathParts.join("/"),
        pathParts,
        cd,
        goToPath,
        resolveFile,
        getFolder,
    };
}

export function searchVfs(query: string): { node: VfsNode; path: string[] }[] {
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
    walk(root as VfsFolder, []);
    return results;
}