import type {VfsFile} from "../../types/vfs";
import { X } from "lucide-react";
import {SafeHtml} from "../SafeHtml.tsx";

export function DetailPanel({ file, onClose }: { file: VfsFile; onClose: () => void }) {
    return (
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
        </div>
    );
}