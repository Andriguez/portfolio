export type VfsBase = {
    name: string;
    slug: string;
    description?: string;
    id: number;
    parentId: number | null;
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