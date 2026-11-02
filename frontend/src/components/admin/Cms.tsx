import "./cms.css";

import { useState, useEffect } from 'react'
import {SafeHtml} from "../SafeHtml.tsx";
import type { UploadedFile } from "../../types/UploadedFile.ts";
import {useNavigate} from "react-router-dom";
import { CopyIcon, DeleteIcon, EditIcon } from "lucide-react";
import { apiFetch, toAPIUrl } from "../../api/client.ts";
import { StaticContentEditor } from './StaticContentEditor.tsx';
import { SocialLinksManager } from './SocialLinksManager.tsx';
import { CvManager } from './CvManager.tsx';
import { SecurityPanel } from './SecurityPanel.tsx';


// TO-DO
// Have to figure out why when creating a node in the root folder it defaults to null and breaks navigation
// Should be careful when adding new nodes
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

    // content manager
    const [nodes, setNodes] = useState<CMSNode[]>([]);
    const [editing, setEditing] = useState<Partial<CMSNode> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [reloadKey, setReloadKey] = useState(0);
    const reload = () => setReloadKey((k) => k + 1);

    useEffect(() => {
        let cancelled = false;
        apiFetch("/api/vfs")
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
        .then((data: CMSNode[]) => {if (!cancelled) setNodes(data); })
            .catch(() => { if (!cancelled) setError("couldn't load content."); });
        return () => { cancelled = true; };
    }, [reloadKey]);


    async function handleSave() {
        if (!editing) return;
        setError(null);
        const isNew = !editing.id;
        const res = await apiFetch(isNew ? "/api/vfs" : `/api/vfs/${editing.id}`, {
            method: isNew ? "POST" : "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editing),
        });
        if (!res.ok) { setError("save failed — check you're still logged in"); return; }
        setEditing(null);
        reload();
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, source: string) {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        const res = await apiFetch("/api/uploads", { method: "POST", body: formData });
        if (!res.ok) { setError("image upload failed"); return; }
        const { url } = await res.json();

        if (source === "node_edit") {
            const imageUrl = toAPIUrl(url);

            setEditing((prev) => (prev ? { ...prev, image: imageUrl } : prev));
        } else if (source === "upload_manager") {
            loadFiles();
            alert("image uploaded successfully!");
            e.target.value = "";
        }
    }

    async function handleNodeDelete(id: number) {
        if (!confirm("delete this node? this can't be undone.")) return;
        const res = await apiFetch(`/api/vfs/${id}`, { method: "DELETE" });
        if (!res.ok) { setError("delete failed — does it still have children?"); return; }
        reload();
    }

    async function handleLogout() {
        const res = await apiFetch("/api/logout", { method: "POST" });
        if (!res.ok) { setError("logout failed"); return; }
        else {navigate("/")}
    }

    // uploads manager
    const [files, setFiles] = useState<UploadedFile[]>([]);

    async function loadFiles() {
        const res = await apiFetch("/api/uploads");
        if (!res.ok) { setError("failed to load uploads"); return; }
    
        setFiles(await res.json());
    }

    useEffect(() => {
        loadFiles();
    }, []);

    async function handleUploadDelete(file: UploadedFile) {
        const warning = file.used_by.length > 0 
            ? `this file is used by: ${file.used_by.join(", ")}. `
            : `Delete "${file.name}"? `;

        if (!confirm(warning)) return;

        setError(null);

        const res = await apiFetch(`/api/uploads/${encodeURIComponent(file.name)}`, { 
            method: "DELETE"
        });

        if (!res.ok) { setError("delete failed"); return; }
        loadFiles();
    }

    function handleCopyUrl(url: string) {
        navigator.clipboard.writeText(url);
        alert(`URL: "${url}" copied to clipboard!`);
    }

    return(
        useIsAuthed() && <div className="admin-panel">
            <div className="admin-header">
                <h2>CONTENT MANAGER</h2>
                <button onClick={() => setEditing({ type: "file", parent_id: null })}>+ new node</button>
                <button className="logout-btn" onClick={handleLogout}>Log Out</button>
            </div>
            <table className="admin-table">
                <thead><tr><th>id</th><th>name</th><th>type</th><th>slug</th><th>parent Id</th><th>actions</th></tr></thead>
                <tbody>
                {nodes.map((n) => (
                    <tr key={n.id}>
                        <td>{n.id}</td>
                        <td>{n.name}</td>
                        <td>{n.type}</td>
                        <td>{n.slug}</td><td>{n.parent_id ?? "—"}</td>
                        <td>
                            <button onClick={() => setEditing(n)}><EditIcon size="12px"/></button>
                            <button onClick={() => handleNodeDelete(n.id)}><DeleteIcon size="12px" /></button>
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
                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "node_edit")} />
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

            {error && <div className="admin-error">{error}</div>}

            <div className="admin-header" style={{ marginTop: "2rem" }}>
                <h2>IMAGE UPLOADS</h2>

                <span className="file-count">{files.length} file(s)</span>
            </div>
            <div className="admin-upload">
                <label >upload image: 
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "upload_manager")} />
                </label>
            </div>

            {files.length === 0 ? (
                <div className="admin-empty">no uploads yet.</div>
            ) : (
                <table className="image-table">
                    <thead>
                        <tr><th>preview</th><th>size</th><th>used by</th><th>actions</th></tr>
                    </thead>
                    <tbody>
                        {files.map((f) => (
                            <tr key={f.name}>
                                <td><img src={toAPIUrl(f.url)} alt={f.name} className="admin-thumb" /></td>
                                <td>{formatSize(f.size)}</td>
                                <td>{f.used_by.length > 0 ? f.used_by.join(", ") : "—"}</td>
                                <td>
                                    <button onClick={() => handleCopyUrl(f.url)}><CopyIcon size="12px" /></button>
                                    <button onClick={() => handleUploadDelete(f)}><DeleteIcon size="12px" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <StaticContentEditor contentKey='hello_message' title='Edit Hello Message' />
            <StaticContentEditor contentKey='stack_info' title='Edit Stack Info' />
            <SocialLinksManager />
            <CvManager />
            <SecurityPanel />
        </div>
    );
}

function useIsAuthed() {
    const [authed, setAuthed] = useState<boolean | null>(null);
    useEffect(() => {
        apiFetch("/api/me")
            .then((res) => setAuthed(res.ok))
            .catch(() => setAuthed(false));
    }, []);
    return authed;
}

function formatSize(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}