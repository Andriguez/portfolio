import type { VfsFolder, VfsNode } from "../types/vfs";

export function findNode(current: VfsFolder, pathParts: string[]): VfsNode | null {
    if (pathParts.length === 0) return current;
    const [next, ...rest] = pathParts;
    const child = current.children.find((c) => c.slug === next);
    if (!child) return null;
    if (child.type === "file") return rest.length === 0 ? child : null;
    return findNode(child, rest);
}

export function resolvePath(root: VfsFolder, base: string[], target: string): string[] | null {
    const isAbsolute = target.startsWith("/") || target.startsWith("~") || target.startsWith("home");
    const segments = target.split("/").filter((s) => s.length > 0 && s !== "~" && s!= "home");
    let working = isAbsolute ? [] : [...base];

    for (const seg of segments) {
        if (seg === ".") continue;
        if (seg === ".." || seg === "back") { working = working.slice(0, -1); continue; }

        const node = findNode(root, working); // <- uses the passed-in root now
        if (!node || node.type !== "folder") return null;

        const child = node.children.find((c) => ((c.slug === seg) || (c.name === seg)) && c.type === "folder");
        if (!child) return null;

        working = [...working, child.slug];
    }
    return working;
}
