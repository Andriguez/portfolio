import type { useVfs } from "../../hooks/useVfs";
import type { VfsNode } from "../../types/vfs";
import { ExplorerItem } from "./ExplorerItem.tsx";
import { useState } from "react";

export function GridColumn({
                               vfs,
                               onOpenFile,
                               items,
                               viewMode,
                               openedFile,
                               onItemClick
                           }: {
    vfs: ReturnType<typeof useVfs>;
    onOpenFile: (slug: string) => void;
    items: VfsNode[];
    viewMode: "grid" | "list";
    openedFile: string | null;
    onItemClick: (item: VfsNode) => void;
}) {
    const { cd } = vfs;

    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        item: VfsNode;
    } | null>(null);

    function handleContextMenu(
        e: React.MouseEvent,
        item: VfsNode
    ) {
        e.preventDefault();

        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            item,
        });
    }

    if (viewMode === "list") {
        return (
            <div className="list-column themed-scrollbar">
                <div className="list-header">
                    <span></span>
                    <span>name</span>
                    <span>last updated</span>
                </div>

                {items.map((item) => (
                    <div
                        key={item.slug}
                        className="list-row"
                        onClick={() => onItemClick(item)}
                        onContextMenu={(e) =>
                            handleContextMenu(e, item)
                        }
                    >
                        <span className="list-row-icon">
                            {item.type === "folder" ? "📁" : "📄"}
                        </span>

                        <span className="list-row-name">
                            {item.name}
                        </span>

                        <span className="list-row-date">
                            {item.updatedAt ?? "—"}
                        </span>
                    </div>
                ))}

                {contextMenu && (
                    <ContextMenu
                        contextMenu={contextMenu}
                        handleClick={onItemClick}
                        setContextMenu={setContextMenu}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="grid-column themed-scrollbar">
            <div key={vfs.currentPath} className="grid-items grid-items--transition">
                {items.map((item) => (
                    <ExplorerItem
                        key={item.slug}
                        item={item}
                        onClick={() => onItemClick(item)}
                        onContextMenu={(e) =>
                            handleContextMenu(e, item)
                        }
                        openedFile={openedFile}
                    />
                ))}
            </div>

            {contextMenu && (
                <ContextMenu
                    contextMenu={contextMenu}
                    handleClick={onItemClick}
                    setContextMenu={setContextMenu}
                />
            )}
        </div>
    );
}

function ContextMenu({
                         contextMenu,
                         handleClick,
                         setContextMenu,
                     }: {
    contextMenu: {
        x: number;
        y: number;
        item: VfsNode;
    };
    handleClick: (item: VfsNode) => void;
    setContextMenu: React.Dispatch<
        React.SetStateAction<{
            x: number;
            y: number;
            item: VfsNode;
        } | null>
    >;
}) {
    return (
        <>
            <div
                className="context-menu-backdrop"
                onClick={() => setContextMenu(null)}
            />

            <div
                className="context-menu"
                style={{
                    top: contextMenu.y,
                    left: contextMenu.x,
                }}
            >
                <div
                    className="menu-item"
                    onClick={() => {
                        handleClick(contextMenu.item);
                        setContextMenu(null);
                    }}
                >
                    open
                </div>

                <div
                    className="menu-item"
                    onClick={() => setContextMenu(null)}
                >
                    properties
                </div>

                <div
                    className="menu-item"
                    onClick={() => {
                        navigator.clipboard.writeText(location.href);
                        setContextMenu(null);
                    }}
                >
                    copy link
                </div>
            </div>
        </>
    );
}