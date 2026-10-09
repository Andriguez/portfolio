import type { VfsNode, VfsFolder } from "../types/vfs";
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

    const byId = new Map<number, any>();
    for (const n of flat) {
        byId.set(n.id, n.type === "folder"
            ? { type: "folder", name: n.name, slug: n.slug, description: n.description ?? undefined, children: [], _id: n.id, _parentId: n.parent_id }
            : { type: "file", name: n.name, slug: n.slug, description: n.description ?? undefined,
                content: { title: n.title ?? n.name, body: n.body ?? "", image: n.image ?? undefined },
                updatedAt: n.updated_at ?? undefined, _id: n.id, _parentId: n.parent_id });
    }

    let root: VfsFolder | null = null;
    for (const node of byId.values()) {
        if (node._parentId === null) root = node;
        else byId.get(node._parentId)?.children.push(node);
    }
    if (!root) throw new Error("no root node found");
    return root as VfsFolder;
}