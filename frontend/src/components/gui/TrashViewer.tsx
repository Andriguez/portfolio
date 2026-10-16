import { useState } from "react";
import type { TrashItem } from "../../types/trash";
import { ExternalLink, X } from "lucide-react";

export function TrashViewer({ item, onClose }: { item: TrashItem, onClose: () => void }) {
    const date = item.date ? new Date(item.date) : null;
    const hidden = item.totalLines ? item.totalLines - item.preview.length : 0;

    const [msg, setMsg] = useState<{ id: string; text: string } | null>(null);
    const id = `${item.hash}-${item.path ?? item.name}`;
    const message = msg?.id === id ? msg.text : null;

    return (
        <div className="trash-detail-panel themed-scrollbar">
        <div className="detail-panel-header">
            <span className="detail-panel-title">$ git show {item.hash} -- {item.name}</span>
            <button className="detail-panel-close" onClick={onClose} aria-label="close">
                <X size={16} />
            </button>
        </div>
        <div className="detail-panel-body">
            <dl className="trash-meta">
                <dt>commit</dt><dd>{item.hash}</dd>
                <dt>path</dt><dd>{item.path ? item.path : "..."}</dd>
                <dt>message</dt><dd>{item.commit}</dd>
                {date && !Number.isNaN(date.getTime()) && (<><dt>deleted</dt><dd>{date.toLocaleDateString()}</dd></>)}
                <dt>size</dt><dd>{item.size}</dd>
            </dl>

            <pre className="trash-diff themed-scrollbar">
                {item.preview.map((line, i) => (
                    <div key={i} className={line.startsWith("-") ? "diff-del" : line.startsWith("+") ? "diff-add" : ""}>
                        {line}
                    </div>
                ))}
                {hidden > 0 && <div className="diff-more">... {hidden} more line(s) not shown</div>}
            </pre>

            <button 
                className="cv-btn" 
                style={{ margin: "0.5rem" }} 
                onClick={() => setMsg({id, text: `could not restore ${item.hash}: ${item.restoreError}`})}
                >
                restore
            </button>

            { import.meta.env.VITE_REPO_URL && (
                <a 
                    className="cv-btn" 
                    href={import.meta.env.VITE_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ margin: "0.3rem"}}
                >
                view repo <ExternalLink size={11} />
                </a>
        )}
            <div className="trash-message" aria-live="polite">{message}</div>
        </div>
        </div>
    );
}