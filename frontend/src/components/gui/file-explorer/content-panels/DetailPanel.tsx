import type {VfsFile} from "../../../../types/vfs.ts";
import { X } from "lucide-react";
import {SafeHtml} from "../../../SafeHtml.tsx";
import { CvViewer } from "./CvViewer.tsx";
import { TrashViewer } from "./TrashViewer.tsx";
import { useNodeBody } from "../../../../hooks/useVfs.ts";

export function DetailPanel({ file, onClose }: { file: VfsFile; onClose: () => void }) {
    const fileId = file.id ?? 0;
    const content = useNodeBody(fileId);

    return (
    file.cv ? (
        <CvViewer cv={file.cv} onClose={onClose} /> 
    ) : file.trash ? (
        <TrashViewer key={`${file.trash.hash}-${file.trash.name}`} item={file.trash} onClose={onClose} />
    ) : content.status === "loading" ? (
            <div className="loading">loading...</div> 
    ) : content.status === "error" ? (
            <div className="error">content couldn't be loaded.</div>
    ) :  (
        <div className="detail-panel themed-scrollbar">
            <div className="detail-panel-header">
                <span className="detail-panel-title">{content?.title}</span>
                <button className="detail-panel-close" onClick={onClose} aria-label="close">
                    <X size={16} />
                </button>
            </div>
            <div className="detail-panel-body">
                {content?.image && (
                    <img src={content.image} alt={content?.title} className="detail-panel-image" />
                )}
                <SafeHtml html={content?.body} />
            </div>
        </div>
    )
    );
}