import type { VfsNode } from "../../types/vfs";

export function ExplorerItem({ item, onClick, onContextMenu, openedFile }: { item: VfsNode, onClick: () => void, onContextMenu?: () => void, openedFile: string | null }) {

    const active = openedFile === item.slug
    return (
        <div className={`grid-item ${ active ? "grid-item-active" : ""}`} onClick={onClick} onContextMenu={onContextMenu}>
                <span className="gui-icon">
                    {item.type === "folder" ? "📁" : "📄"}
                </span>
            <span className="gui-item-label">{item.name}</span>
        </div>
    )
}