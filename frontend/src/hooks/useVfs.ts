import { useState } from "react";
import type { VfsNode, VfsFolder } from "../types/vfs";
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

    function cd(target: string) {
        if (target === "..") {
            setPathParts((p) => p.slice(0, -1));
            return true;
        }
        const found = currentFolder.children.find(
            (c) => c.slug === target && c.type === "folder"
        );
        if (found) {
            setPathParts((p) => [...p, target]);
            return true;
        }
        return false;
    }

    function resolveFile(target: string) {
        const found = currentFolder.children.find(
            (c) => c.slug === target && c.type === "file"
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