import { useState } from "react";
import { Download, ExternalLink, Link2 } from "lucide-react";
import { API_URL } from "../../api/client";

export function CvViewer({ cv }: { cv: { type: string; size: number; filename: string } }) {
    const [copied, setCopied] = useState(false);
    const viewUrl = `${API_URL}/api/cv/${cv.type}/view`;
    const downloadUrl = `${API_URL}/api/cv/${cv.type}/download`;
    const shareUrl = `${window.location.origin}/cv?open=${cv.type}&mode=gui`;

    async function copyLink() {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <div className="cv-viewer">
            <div className="cv-viewer-actions">
                <a className="cv-btn cv-btn--primary" href={downloadUrl}><Download size={13} /> </a>
                <a className="cv-btn" href={viewUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={13} /> </a>
                <button className="cv-btn" onClick={copyLink}><Link2 size={13} /> {copied ? "copied" : "copy link"}</button>
            </div>
            <iframe className="cv-viewer-frame" src={viewUrl} title={cv.filename} />
        </div>
    );
}