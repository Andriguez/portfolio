import { API_URL } from "../../api/client";
import { CvViewer } from "../gui/CvViewer";

const formatSize = (b: number) => (b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

    async function copyLink(shareUrl: string) {
        await navigator.clipboard.writeText(shareUrl);
        alert("cv url copied!");
    }

export function CvList({ cvs, runCommand }: { cvs: { type: string; name: string; size: number }[]; runCommand: (cmd: string) => void }) {
    return (
        <div>
            {cvs.map((cv, i) => (
                <div key={cv.type} className="cv-list-row" style={{ animationDelay: `${i * 80}ms` }}>
                    <span className="cv-list-type">{cv.type}</span>
                    <span className="cv-list-name"> · {cv.name} · {formatSize(cv.size)}</span>
                    <span className="cv-list-actions">
                        <button type="button" onClick={(e) => { e.stopPropagation(); runCommand(`cat ${cv.type}`); }}>[view]</button>
                        <a href={`${API_URL}/api/cv/${cv.type}/download`} onClick={(e) => e.stopPropagation()}>[download]</a>
                        <a href="#" onClick={(e) => {copyLink(`${window.location.origin}/my_cv?open=${cv.type}&mode=cli`); e.stopPropagation()} }>[copy link]</a>
                    </span>
                </div>
            ))}
        </div>
    );
}