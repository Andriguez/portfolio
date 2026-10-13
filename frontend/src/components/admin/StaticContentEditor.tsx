import { useEffect, useState } from "react";
import { Save } from "lucide-react"
import { apiFetch } from "../../api/client";

export function StaticContentEditor({ contentKey, title }: {contentKey: string, title: string}){
    const [value, setValue] = useState("")
    const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

    useEffect(() => {
        apiFetch("/api/static_content").then((r) => r.json()).then((data) => setValue(data[contentKey] ?? ""));
    }, [contentKey]);


    async function handleSave() {
        setStatus("saving")
        const res = await apiFetch(`/api/static_content/${contentKey}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({value})
        })

        setStatus(res.ok ? "saved" : "error");
    }

    return (
        <div className="admin-section">
            <div className="admin-header">
                <h2 style={{textTransform: 'uppercase'}}>{title}</h2>
            </div>
            <textarea
                className="admin-textarea-input"
                rows={4}
                placeholder={value}
                value={value}
                onChange={(e) => { setValue(e.target.value); setStatus("idle");}} 
            />
            <button className="admin-save-btn" onClick={handleSave} disabled={status === "saving"}>
                <Save size="12px" />
            </button>
             {status === "saved" && <span className="admin-count"> saved</span>}
            {status === "error" && <span className="admin-error"> save failed</span>}
        </div>
    );
}