import { API_URL } from "../../api/client";

const formatSize = (b: number) => (b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

export function CvList({ cvs }: { cvs: { type: string; name: string; size: number }[] }) {
    return (
        <div>
            {cvs.map((cv, i) => (
                <div key={cv.type} className="cv-list-row" style={{ animationDelay: `${i * 80}ms` }}>
                    <span className="cv-list-type">{cv.type}</span>
                    <span className="cv-list-name">{cv.name} · {formatSize(cv.size)}</span>
                    <span className="cv-list-actions">
                        <a href={`${API_URL}/api/cv/${cv.type}/view`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>[view]</a>
                        <a href={`${API_URL}/api/cv/${cv.type}/download`} onClick={(e) => e.stopPropagation()}>[download]</a>
                    </span>
                </div>
            ))}
        </div>
    );
}