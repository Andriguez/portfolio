import type { useVfs } from "../../hooks/useVfs";
import type { VfsNode } from "../../types/vfs";
import { ExplorerItem } from "./ExplorerItem.tsx";
import {useState} from "react";

export function GridColumn({
                               vfs, onOpenFile, items, viewMode
                           }: {
    vfs: ReturnType<typeof useVfs>; onOpenFile: (slug: string) => void; items: VfsNode[]; viewMode: "grid" | "list";
}) {
    const { cd } = vfs;

    function handleClick(item: (typeof items)[number]) {
        if (item.type === "folder") cd(item.slug);
        else onOpenFile(item.slug);
    }
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: VfsNode } | null>(null);


    if (viewMode === "list") {
        return (
            <div className="list-column themed-scrollbar">
                <div className="list-header">
                    <span></span><span>name</span><span>last updated</span>
                </div>
                {items.map((item) => (
                    <div key={item.slug} className="list-row" onClick={() => handleClick(item)}>
                        <span className="list-row-icon">
                            {item.type === "folder" ? "📁" : "📄"}
                        </span>
                        <span className="list-row-name">
                            {item.name}
                        </span>
                        <span className="list-row-date">{item.updatedAt ?? "—"}</span>
                    </div>
                ))}
                { contextMenu && ( <ContextMenu handleClick={handleClick()} handleContextMenu={handleContextMenu()} /> )}
            </div>
        );
    }

    return (
        <div className="grid-column themed-scrollbar">
            <div className="grid-items">
                {items.map((item) => (
                    <ExplorerItem item={item} onClick={() => handleClick(item)} />
                ))}
            </div>
        </div>
    );
}

function ContextMenu( handleClick, setContextMenu) {

    function handleContextMenu(e: React.MouseEvent, item: VfsNode) {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, item });
    }

    return (
        <>
            <div className="context-menu-backdrop" onClick={() => setContextMenu(null)}/>
            <div className="context-menu" style={{top: contextMenu.y, left: contextMenu.x}}>
                <div className="menu-item" onClick={() => {
                    handleClick(contextMenu.item);
                    setContextMenu(null);
                }}>open
                </div>
                <div className="menu-item" onClick={() => setContextMenu(null)}>properties</div>
                <div className="menu-item" onClick={() => {
                    navigator.clipboard.writeText(location.href);
                    setContextMenu(null);
                }}>copy link
                </div>
            </div>
        </>
    )
}