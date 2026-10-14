import * as React from "react";
import type { VfsNode } from "../../types/vfs";

export function ExplorerItem({ item, onClick, onTouchStart, onTouchMove, onTouchEnd, onContextMenu, openedFile }: { item: VfsNode, onClick: () => void, onTouchStart: (e: React.TouchEvent) => void, onTouchMove: (e: React.TouchEvent) => void, onTouchEnd: (e: React.TouchEvent) => void, onContextMenu?: (e: React.MouseEvent) => void, openedFile: string | null }) {

    const active = openedFile === item.slug
    return (
        <div className={`grid-item ${ active ? "grid-item-active" : ""}`}
             onClick={onClick}
             onContextMenu={() => onContextMenu}
             onTouchStart={() => onTouchStart}
             onTouchMove={() => onTouchMove}
             onTouchEnd={() => onTouchEnd}>
                <span className="gui-icon">
                    {item.type === "folder" ? "📁" : item.cv ? "📃" : "📄"}
                </span>
            <span className="gui-item-label">{item.name}</span>
        </div>
    )
}