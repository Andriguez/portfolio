import type { VfsFile } from "../../types/vfs"
import {SafeHtml} from "../SafeHtml.tsx";

export function FileContentCard({ file }: { file: VfsFile }) {
    return (
        <div className="content-card">
            <div className="content-card-title">{file?.content?.title}</div>
            {file?.content?.image && (
                <img src={file.content.image} alt={file.content.title} className="content-card-image" />
            )}
            <div className="content-card-body"> <SafeHtml html={file?.content?.body}/></div>
        </div>
    );
}