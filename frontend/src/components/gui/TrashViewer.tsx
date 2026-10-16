import { useState } from "react";
import type { TrashItem } from "../../types/trash";
import { X } from "lucide-react";

export function TrashViewer({ item, onClose }: { item: TrashItem, onClose: () => void }) {
    const [message, setMessage] = useState<string | null>(null);
    const date = item.date ? new Date(item.date) : null;

    return (
        <div className="trash-detail-panel">
        <div className="detail-panel-header">
            <span className="detail-panel-title">$ git show {item.hash} -- {item.path ?? item.name}</span>
            <button className="detail-panel-close" onClick={onClose} aria-label="close">
                <X size={16} />
            </button>
        </div>
        <div className="detail-panel-body">
            <dl className="trash-meta">
                <dt>commit</dt><dd>{item.hash}</dd>
                <dt>message</dt><dd>{item.commit}</dd>
                {date && !Number.isNaN(date.getTime()) && (<><dt>deleted</dt><dd>{date.toLocaleDateString()}</dd></>)}
                <dt>size</dt><dd>{item.size}</dd>
            </dl>

            <pre className="trash-diff">
                {item.preview.map((line, i) => (
                    <div key={i} className={line.startsWith("-") ? "diff-del" : line.startsWith("+") ? "diff-add" : ""}>
                        {line}
                    </div>
                ))}
            </pre>

            <button className="cv-btn" onClick={() => setMessage(`could not restore ${item.hash}: ${item.restoreError}`)}>
                restore
            </button>
            <div className="trash-message" aria-live="polite">{message}</div>
        </div>
        </div>
    );
}