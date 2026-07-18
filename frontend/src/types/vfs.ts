export type VfsFile = {
    type: "file";
    name: string;
    slug: string;
    content: {
        title: string;
        body: string;
    };
};

export type VfsFolder = {
    type: "folder";
    name: string;
    slug: string;
    children: VfsNode[];
};

export type VfsNode = VfsFile | VfsFolder;