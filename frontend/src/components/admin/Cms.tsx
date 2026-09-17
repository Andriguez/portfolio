import { useState, useEffect } from 'react'
import {SafeHtml} from "../SafeHtml.tsx";
import "./cms.css";
import {useNavigate} from "react-router-dom";
import {DeleteIcon, EditIcon} from "lucide-react";

type CMSNode = {
    id: number;
    parent_id: number | null;
    type: "folder" | "file";
    name: string;
    slug: string;
    description: string | null;
    title: string | null;
    body: string | null;
    image: string | null;
}
export function CMS(){

    const [nodes, setNodes] = useState<CMSNode[]>([]);
    const [editing, setEditing] = useState<Partial<CMSNode> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    async function loadNodes() {
        const res = await fetch("http://localhost:8000/api/vfs", { credentials: "include"});
        setNodes(await res.json());
    }

    useEffect(() => {
        loadNodes();
    }, []);

    async function handleSave() {
        if (!editing) return;
        setError(null);
        const isNew = !editing.id;
        const res = await fetch(isNew ? "http://localhost:8000/api/vfs" : `http://localhost:8000/api/vfs/${editing.id}`, {
            method: isNew ? "POST" : "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(editing),
        });
        if (!res.ok) { setError("save failed — check you're still logged in"); return; }
        setEditing(null);
        loadNodes();
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("http://localhost:8000/api/uploads", { method: "POST", credentials: "include", body: formData });
        if (!res.ok) { setError("image upload failed"); return; }
        const { url } = await res.json();
        setEditing((prev) => (prev ? { ...prev, image: url } : prev));
    }

    async function handleDelete(id: number) {
        if (!confirm("delete this node? this can't be undone.")) return;
        const res = await fetch(`http://localhost:8000/api/vfs/${id}`, { method: "DELETE", credentials: "include" });
        if (!res.ok) { setError("delete failed — does it still have children?"); return; }
        loadNodes();
    }

    async function handleLogout() {
        const res = await fetch("http://localhost:8000/api/logout", { method: "POST", credentials: "include" });
        if (!res.ok) { setError("logout failed"); return; }
        else {navigate("/")}
    }

    return(
        useIsAuthed() && <div className="admin-panel">
            <div className="admin-header">
                <h2>CONTENT MANAGER</h2>
                <button onClick={() => setEditing({ type: "file", parent_id: null })}>+ new node</button>
                <button className="logout-btn" onClick={handleLogout}>Log Out</button>
            </div>
            <table className="admin-table">
                <thead><tr><th>name</th><th>type</th><th>slug</th><th>parent</th><th /></tr></thead>
                <tbody>
                {nodes.map((n) => (
                    <tr key={n.id}>
                        <td>{n.name}</td><td>{n.type}</td><td>{n.slug}</td><td>{n.parent_id ?? "—"}</td>
                        <td>
                            <button onClick={() => setEditing(n)}><EditIcon size="12px"/></button>
                            <button onClick={() => handleDelete(n.id)}><DeleteIcon size="12px" /></button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {editing && (
                <div className="admin-form-overlay" onClick={() => setEditing(null)}>
                    <div className="admin-form" onClick={(e) => e.stopPropagation()}>
                        <label>type
                            <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as "folder" | "file" })}>
                                <option value="folder">folder</option>
                                <option value="file">file</option>
                            </select>
                        </label>
                        <label>parent
                            <select value={editing.parent_id ?? ""} onChange={(e) => setEditing({ ...editing, parent_id: e.target.value ? Number(e.target.value) : null })}>
                                { nodes.filter((n) => n.type === "folder").map((n) => (<option key={n.id} value={n.id}> {n.name} </option>))}
                            </select>
                        </label>
                        <label>name
                            <input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                        </label>
                        <label>slug
                            <input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
                        </label>
                        <label>description
                            <input value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                        </label>
                        {editing.type === "file" && (
                            <>
                                <label>title
                                    <input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                                </label>
                                <label>body (HTML)
                                    <textarea rows={10} value={editing.body ?? ""} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
                                </label>
                                <div className="admin-preview">
                                    <div className="admin-preview-label">preview</div>
                                    <SafeHtml html={editing.body ?? ""} className="admin-preview-frame" />
                                </div>
                                <label>upload image
                                    <input type="file" accept="image/*" onChange={handleImageUpload} />
                                </label>
                                {editing.image && <img src={editing.image} alt="preview" className="admin-image-preview" />}
                                <label>or paste an image URL
                                    <input value={editing.image ?? ""} onChange={(e) => setEditing({ ...editing, image: e.target.value })} />
                                </label>
                            </>
                        )}
                        <div className="admin-form-actions">
                            <button onClick={() => setEditing(null)}>cancel</button>
                            <button onClick={handleSave}>save</button>
                        </div>
                        {error && <div className="admin-error">{error}</div>}
                    </div>
                </div>
            )}
        </div>
    );
}

function useIsAuthed() {
    const [authed, setAuthed] = useState<boolean | null>(null);
    useEffect(() => {
        fetch("http://localhost:8000/api/me", { credentials: "include" })
            .then((res) => setAuthed(res.ok))
            .catch(() => setAuthed(false));
    }, []);
    return authed;
}