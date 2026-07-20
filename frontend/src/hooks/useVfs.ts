import { useState } from "react";
import type { VfsNode, VfsFolder, VfsFile } from "../types/vfs";
import { root } from "../data/vfs";

function findNode(current: VfsFolder, pathParts: string[]): VfsNode | null {
    if (pathParts.length === 0) return current;
    const [next, ...rest] = pathParts;
    const child = current.children.find((c) => c.slug === next);
    if (!child) return null;
    if (child.type === "file") {
        return rest.length === 0 ? child : null;
    }
    return findNode(child, rest);
}

export function useVfs() {
    const [pathParts, setPathParts] = useState<string[]>([]);

    const currentFolder = (findNode(root as VfsFolder, pathParts) ??
        root) as VfsFolder;

    function resolvePath(base: string[], target: string): string[] | null {
        const isAbsolute = target.startsWith("/") || target.startsWith("~");
        const segments = target.split("/").filter((s) => s.length > 0 && s !== "~");
        let working = isAbsolute ? [] : [...base];

        for (const seg of segments) {
            if (seg === ".") continue;
            if (seg === "..") {
                working = working.slice(0, -1);
                continue;
            }
            const node = findNode(root as VfsFolder, working);
            if (!node || node.type !== "folder") return null;
            const child = node.children.find((c) => c.slug === seg && c.type === "folder");
            if (!child) return null;
            working = [...working, seg];
        }

        return working;
    }

    function cd(target: string): boolean {
        const resolved = resolvePath(pathParts, target);
        if (resolved === null) return false;
        setPathParts(resolved);
        return true;
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
        cd,
        resolveFile,
    };
}