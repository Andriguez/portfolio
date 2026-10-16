export type TrashItem = {
    name: string;
    path?: string;
    size: string;
    hash: string;
    commit: string;
    date?: string
    preview: string[];
    restoreError: string;
    totalLines?: number
};