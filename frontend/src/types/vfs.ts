import type { TrashItem } from "./trash";

export type VfsBase = {
    id?: number;
    name: string;
    slug: string;
    description?: string;
    parentId?: number | null;
    cv?: { type: string; size: number; filename: string; uploaded_at: string;};
    trash?: TrashItem;
}

export type VfsFile = VfsBase & {
    type: "file";
    content?: {
        title?: string;
        body?: string;
        image?: string;
    };
    updatedAt?: string;
};

export type VfsFolder = VfsBase & {
    type: "folder";
    children: VfsNode[];
    updatedAt?: string;
};

export type VfsNode = VfsFile | VfsFolder;