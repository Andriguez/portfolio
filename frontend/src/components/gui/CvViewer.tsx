import { CopyIcon, Download, ExternalLink, Link2, X } from "lucide-react";
import { API_URL } from "../../api/client";
import { CV_PLACE } from "../../hooks/useVfs";

export function CvViewer({ cv, onClose }: { cv: { type: string; size: number; filename: string;}, onClose: () => void }) {
    const viewUrl = `${API_URL}/api/cv/${cv.type}/view`;
    const embedUrl = `${viewUrl}#toolbar=0&navpanes=0&view=FitH` //allows iframe to open without a toolbar (chrome and edge for now)

    const downloadUrl = `${API_URL}/api/cv/${cv.type}/download`;
    const shareUrl = `${window.location.origin}/${CV_PLACE}?open=${cv.type}&mode=gui`;

    async function copyLink() {
        await navigator.clipboard.writeText(shareUrl);
    }

    return (
        <div className="cv-viewer detail-panel themed-scrollbar">
            <div className="cv-viewer-actions">
                <a title="download cv" className="cv-btn cv-btn--primary" href={downloadUrl}><Download size={13} /> </a>
                <a title="open cv in new tab" className="cv-btn" href={viewUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={13} /> </a>
                <button title="copy cv link" className="cv-btn" onClick={copyLink}><CopyIcon size={13} /><Link2 size={13} /></button>
                <button className="detail-panel-close" onClick={onClose} aria-label="close" style={{marginLeft: "auto"}}>
                    <X size={16} />
                </button>
            </div>
            <iframe className="cv-viewer-frame" src={embedUrl} title={cv.filename} />
        </div>
    );
}