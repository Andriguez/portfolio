export type VfsFile = {
    type: "file";
    name: string;
    slug: string;
    description?: string;
    content?: {
        title: string;
        body: string;
        image?: string;
    };
    updatedAt: string;
};

export type VfsFolder = {
    type: "folder";
    name: string;
    slug: string;
    description?: string;
    children: VfsNode[];
    updatedAt: string;
};

export type VfsNode = VfsFile | VfsFolder;