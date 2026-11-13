import type { VfsFile } from "../types/vfs";

export type Changelog = {
    status: "loading" | "empty" | "error" | "ready";
    description: string;
    updated_at: string | undefined;
    content: { title: string; body: string }
}

export const LOADING_CHANGELOG: Changelog = {
    status: "loading",
    description: "check what i've been doing here.",
    updated_at: undefined,
    content: { title: "CHANGELOG.md", body: "<p>loading..</p>" }
}

export function changelogToNode(changelog: Changelog, parentId: number): VfsFile | null {

    if (changelog.status === "empty" || changelog.status === "error") return null;

    return {
        type: "file",
        name: "changelog.md",
        slug: "changelog",
        description: changelog.description,
        updatedAt: changelog.updated_at,
        content: { title: changelog.content.title, body: changelog.content.body },
        parentId
    };
}