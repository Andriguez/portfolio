import { useEffect, useState } from "react";
import { CopyIcon, Trash2 as DeleteIcon, ExternalLink } from "lucide-react";
import { apiFetch, API_URL } from "../../api/client";
import type { Cv } from "../../types/cv"

export function CvManager() {
    const [cvs, setCvs] = useState<Cv[]>([]);
    const [type, setType] = useState("");
    const [error, setError] = useState<string | null>(null);

    const [reloadKey, setReloadKey] = useState(0);
    const reload = () => setReloadKey((k) => k + 1);

    useEffect(() => {
        let cancelled = false;

        apiFetch("/api/cv/admin")
        .then((res) => res.ok ? res.json() : Promise.reject(new Error(String(res.status))))
        .then((data: Cv[]) => { if (!cancelled) setCvs(data); })
            .catch(() => { if (!cancelled) setError("couldn't load cvs info.") });
        return () => { cancelled = true };
    }, [reloadKey])

    async function handleCvUpload(e:React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        const input = e.target;
        if (!file) return;

        const cleanType = type.trim().toLowerCase();
        setError(null);

        if (!cleanType) { 
            setError("enter a type first (e.g. sec)");
            input.value = "";
            return; 
        }

        if (cvs.some((c) => c.type === cleanType) && !confirm(`A "${cleanType}" cv already exists. Replace it?`)) {
            input.value = "";
            return;
        }

        const formData = new FormData();
        formData.append("type", cleanType);
        formData.append("file", file);
        const res = await apiFetch("/api/cv", {method: "POST", body: formData});
        if (!res.ok) {
            const detail = (await res.json().catch(() => null))?.detail;
            setError(detail ?? "uplload failed")
        } else {
            reload();
        }

        e.target.value = "";
        input.value = ""
    }

    async function handleDelete(cv: Cv) {
        if (!confirm(`Delete "${cv.filename}" of type "${cv.type}"?`)) return;
        const res = await apiFetch(`/api/cv/${cv.type}`, { method: "DELETE" });
        if (!res.ok) { setError("delete failed"); return; }
        reload();
    }

    const shareLink = (t: string) => `${window.location.origin}/cv?open=${t}&mode=gui`;

    return (
            <div className="admin-section">
                 <div className="admin-header" style={{ marginTop: "2rem" }}>
                <h2>CV UPLOAD</h2>
                </div>
                <div className="admin-inline-form admin-upload">
                <input list="cv-types" placeholder="type (sec, dev, ...)" value={type} onChange={(e) => setType(e.target.value)} />
                <datalist id="cv-types">
                    {[...new Set([...PRESETS, ...cvs.map((c) => c.type)])].map((t) => <option key={t} value={t} />)}
                </datalist>
                <input type="file" accept="application/pdf" onChange={handleCvUpload} />
            </div>

            {error && <div className="admin-error">{error}</div>}

            {cvs.length === 0 ? (
                <div className="admin-empty">no uploads yet.</div>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr><th>type</th><th>name</th><th>size</th><th># downloads</th><th>Date</th><th>actions</th></tr>
                    </thead>
                    <tbody>
                        {cvs.map((cv) => (
                            <tr key={cv.type}>
                                <td>{cv.type}</td>
                                <td title={cv.filename}>{cv.filename}</td>
                                <td>{formatSize(cv.size)}</td>
                                <td>{cv.download_count}</td>
                                <td>{new Date(cv.uploaded_at).toLocaleDateString()}</td>
                                <td>
                                    <button title="open" onClick={() => window.open(`${API_URL}/api/cv/${cv.type}/view`, "_blank")}><ExternalLink size="12px" /></button>
                                    <button title="copy share url" onClick={() => navigator.clipboard.writeText(shareLink(cv.type))}><CopyIcon size="12px" /></button>
                                    <button title="delete" onClick={() => handleDelete(cv)}><DeleteIcon size="12px" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            </div>
    );
}

const PRESETS = ["sec", "dev", "general"];

function formatSize(bytes: number) {
    return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}