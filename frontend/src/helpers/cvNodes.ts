import type { VfsFile } from "../types/vfs";
import type { SiteData } from "../hooks/useSiteData";

export function cvToNode(cv: SiteData["cvs"][number]): VfsFile {
    return {
        type: "file",
        name: `${cv.type}.pdf`,
        slug: cv.type,
        description: cv.name,
        updatedAt: cv.created_at,
        cv: { type: cv.type, size: cv.size, filename: cv.name },
        content: { title: `CV (${cv.type})`, body: "" },
    };
}