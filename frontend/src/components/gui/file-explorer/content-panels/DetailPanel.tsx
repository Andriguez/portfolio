import type {VfsFile} from "../../../../types/vfs.ts";
import { X } from "lucide-react";
import {SafeHtml} from "../../../SafeHtml.tsx";
import { CvViewer } from "./CvViewer.tsx";
import { TrashViewer } from "./TrashViewer.tsx";

export function DetailPanel({ file, onClose }: { file: VfsFile; onClose: () => void }) {
    return (
    file.cv ? (
        <CvViewer cv={file.cv} onClose={onClose} /> 
    ) : file.trash ? (
        <TrashViewer key={`${file.trash.hash}-${file.trash.name}`} item={file.trash} onClose={onClose} />
    ) : (
        <div className="detail-panel themed-scrollbar">
            <div className="detail-panel-header">
                <span className="detail-panel-title">{file?.content?.title}</span>
                <button className="detail-panel-close" onClick={onClose} aria-label="close">
                    <X size={16} />
                </button>
            </div>
            <div className="detail-panel-body">
                {file?.content?.image && (
                    <img src={file.content.image} alt={file?.content?.title} className="detail-panel-image" />
                )}
                <SafeHtml html={file?.content?.body} />
            </div>
        </div>)
    );
}