import type { VfsFolder, VfsNode } from "../types/vfs";
import { apiFetch } from "./client";

type FlatNode = {
    id: number; parent_id: number | null; type: "folder" | "file";
    name: string; slug: string; description: string | null;
    title: string | null; body: string | null; image: string | null;
    updated_at: string | null;
};

export async function fetchVfsTree(): Promise<VfsFolder> {
    const res = await apiFetch("/api/vfs");
    if (!res.ok) throw new Error("failed to load site content");

    const flat: FlatNode[] = await res.json();

    const entries = new Map<number, { node: VfsNode; parentId: number | null }>();

    for (const n of flat) {
        const node: VfsNode =
            n.type === "folder" 
            ? { 
                type: "folder", name: n.name, slug: n.slug,
                description: n.description ?? undefined, children: [], 
            }
            : { 
                type: "file", name: n.name, 
                slug: n.slug, description: n.description ?? undefined,
                updatedAt: n.updated_at ?? undefined,
                content: { 
                    title: n.title ?? n.name, 
                    body: n.body ?? "", 
                    image: n.image ?? undefined 
                },
            };
            
        entries.set(n.id, { node, parentId: n.parent_id})
    }

    const roots: VfsFolder[] = [];

    for (const { node, parentId } of entries.values()) {
        if (parentId === null) {
            if (node.type === "folder") roots.push(node);
            continue;
        }
        const parent = entries.get(parentId)?.node;

        if (parent?.type === "folder") parent.children.push(node);
    }


    if (roots.length !== 1) throw new Error(`expected exactly one root folder, found ${roots.length}`);

    return roots[0];
}