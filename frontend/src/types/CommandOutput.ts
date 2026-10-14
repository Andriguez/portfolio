import type { Cv } from "./cv";
import type { VfsFile } from "./vfs"
export type CommandOutput =
    | { type: "text"; value: string, color: string }
    | { type: "list"; items: { name: string, slug: string, isFolder: boolean, description: string, itemCount: number, updatedAt: string }[], color: string }
    | { type: "error"; value: string, color: string }
    | { type: "none", color: string}
    | { type: "markdown", file: VfsFile , color: string }
    | { type: "help", extra: boolean, color: string}
    | { type: "link", value: string, url: string, color: string }
    | { type: "cv-list"; cvs: {type: string; name: string; size: number}[]; color: string}
    | { type: "cv-view"; cv: Cv; color: string}
    | { type: "link-list"; links: { id: number; name: string; url: string }[]; color: string }
    | { type: "changelog"; file: string; color: string};
