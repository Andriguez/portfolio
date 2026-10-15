import { useEffect, useState } from "react";
import { Pencil as EditIcon, Trash2 as DeleteIcon } from "lucide-react";
import { apiFetch } from "../../api/client";

type Link = { id: number; name: string; url: string };

export function SocialLinksManager() {
    const [links, setLinks] = useState<Link[]>([]);
    const [form, setForm] = useState<{ id?: number; name: string; url: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const reload = () => setReloadKey((k) => k + 1);
    
    useEffect(() => {
        let cancelled = false;
        
        apiFetch("/api/links")
        .then((res) => res.ok ? res.json() : Promise.reject(new Error(String(res.status))))
        .then((data: Link[]) => { if (!cancelled) setLinks(data); })
            .catch(() => { if (!cancelled) setError("couldn't load links data.") });
        return () => { cancelled = true };
    }, [reloadKey])


    async function handleSave() {
        if (!form) return;
        setError(null);
        const isNew = form.id === undefined;
        const res = await apiFetch(isNew ? "/api/links" : `/api/links/${form.id}`, {
            method: isNew ? "POST" : "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: form.name, url: form.url }),
        });
        if (!res.ok) {
            setError("couldn't save, the url must start with http:// or https://");
            return;
        }
        setForm(null);
        reload();
    }

    async function handleDelete(link: Link) {
        if (!confirm(`Delete "${link.name}"?`)) return;
        await apiFetch(`/api/links/${link.id}`, { method: "DELETE" });
        reload();
    }

    return (
        <div className="admin-section">
            <div className="admin-header">
                <h2>SOCIAL LINKS</h2>
                <button onClick={() => setForm({ name: "", url: "https://" })}>+ new link</button>
            </div>
            {error && <div className="admin-error">{error}</div>}

            {form && (
                <div className="admin-inline-form">
                    <input placeholder="name (e.g. github)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <input placeholder="https://..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
                    <button onClick={handleSave}>save</button>
                    <button onClick={() => setForm(null)}>cancel</button>
                </div>
            )}

            {links.length === 0 ? (
                <div className="admin-empty">no links yet.</div>
            ) : (
                <table className="image-table">
                    <thead><tr><th>name</th><th>url</th><th>actions</th></tr></thead>
                    <tbody>
                        {links.map((l) => (
                            <tr key={l.id}>
                                <td>{l.name}</td>
                                <td title={l.url}>{l.url}</td>
                                <td>
                                    <button onClick={() => setForm(l)}><EditIcon size="12px" /></button>
                                    <button onClick={() => handleDelete(l)}><DeleteIcon size="12px" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}