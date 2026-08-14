import type { VfsNode } from "../../types/vfs";

export function ExplorerItem({ item, onClick }: { item: VfsNode, onClick: () => void }) {

    return (
        <div className="grid-item" onClick={onClick}>
                <span className="gui-icon">
                    {item.type === "folder" ? "📁" : "📄"}
                </span>
            <span className="gui-item-label">{item.name}</span>
        </div>
    )
}