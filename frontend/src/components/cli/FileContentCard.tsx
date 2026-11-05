import { useNodeBody } from "../../hooks/useVfs.ts";
import type { VfsFile } from "../../types/vfs"
import {SafeHtml} from "../SafeHtml.tsx";

export function FileContentCard({ file }: { file: VfsFile }) {
    const fileId = file.id ?? 0;
    const content = useNodeBody(fileId);

    if (file.id === undefined) return <div className="error">couldn't load this page.</div>
    if (content.status === "loading") return <div className="loading"> loading..</div>
    if (content.status === "error") return <div className="error">couldn't load this page.</div>

    return (
        <div className="content-card">
            <div className="content-card-title">{content?.title}</div>
            {content?.image && (
                <img src={content.image} alt={content.title} className="content-card-image" />
            )}
            <div className="content-card-body"> <SafeHtml html={content?.body}/></div>
        </div>
    );
}