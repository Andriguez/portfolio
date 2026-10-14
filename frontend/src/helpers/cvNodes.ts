import type { VfsFile } from "../types/vfs";
import type { SiteData } from "../hooks/useSiteData";

export function cvToNode(cv: SiteData["cvs"][number]): VfsFile {
    return {
        type: "file",
        name: `cv-${cv.type}.pdf`,
        slug: cv.type,
        description: cv.filename,
        updatedAt: cv.uploaded_at,
        cv: { type: cv.type, size: cv.size, filename: cv.filename, uploaded_at: cv.uploaded_at },
        content: { title: `CV (${cv.type})`, body: "" },
    };
}