export type VfsBase = {
    name: string;
    slug: string;
    description?: string;
    id?: number;
    parentId?: number | null;
    cv?: { type: string; size: number; filename: string; uploaded_at: string;}
}

export type VfsFile = VfsBase & {
    type: "file";
    content?: {
        title: string;
        body: string;
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