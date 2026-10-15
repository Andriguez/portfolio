import { API_URL } from "../../api/client";
import { CV_PLACE } from "../../hooks/useVfs";
import type { Cv } from "../../types/cv";

const formatSize = (b: number) => (b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

    async function copyLink(shareUrl: string) {
        await navigator.clipboard.writeText(shareUrl);
        alert("cv url copied!");
    }

export function CvList({ cvs, runCommand }: { cvs: Cv[]; runCommand: (cmd: string) => void }) {
    return (
        <div>
            {cvs.map((cv, i) => (
                <div key={cv.type} className="cv-list-row" style={{ animationDelay: `${i * 80}ms` }}>
                    <span className="cv-list-type">{cv.type}</span>
                    <span className="cv-list-name"> · {cv.filename} · {formatSize(cv.size)}</span>
                    <span className="cv-list-actions">
                        <button type="button" onClick={(e) => { e.stopPropagation(); runCommand(`cat ${cv.type}`); }}>[view]</button>
                        <a href={`${API_URL}/api/cv/${cv.type}/download`} onClick={(e) => e.stopPropagation()}>[download]</a>
                        <button type="button" onClick={(e) => {copyLink(`${window.location.origin}/${CV_PLACE}?open=${cv.type}&mode=cli`); e.stopPropagation()} }>[copy link]</button>
                    </span>
                </div>
            ))}
        </div>
    );
}