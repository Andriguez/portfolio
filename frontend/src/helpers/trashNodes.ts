import type { TrashItem } from "../types/trash";
import type { VfsFile } from "../types/vfs";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function trashToNode(item: TrashItem): VfsFile {
    return {
        type: "file",
        name: item.name,
        slug: `${item.hash}-${slugify(item.name)}`,
        description: item.commit,
        updatedAt: item.date,
        trash: item,
        content: { title: item.name, body: "" },
    };
}