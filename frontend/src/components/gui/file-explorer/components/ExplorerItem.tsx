import type { VfsNode } from "../../../../types/vfs";

export function ExplorerItem({ item, onClick, openedFile }: { item: VfsNode, onClick: () => void, openedFile: string | null }) {

    const active = openedFile === item.slug
    return (
        <div className={`grid-item ${ active ? "grid-item-active" : ""}`}
             onClick={onClick}
        >
                <span className="gui-icon">
                    {item.type === "folder" ? "📁" : item.cv ? "📃" : "📄"}
                </span>
            <span className="gui-item-label">{item.name}</span>
        </div>
    )
}