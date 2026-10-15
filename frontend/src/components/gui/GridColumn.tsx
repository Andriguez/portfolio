import type { useVfs } from "../../hooks/useVfs";
import type { VfsNode } from "../../types/vfs";
import { ExplorerItem } from "./ExplorerItem.tsx";
import * as React from "react";

export function GridColumn({
                               vfs,
                               items,
                               viewMode,
                               openedFile,
                               onItemClick
                           }: {
    vfs: ReturnType<typeof useVfs>;
    items: VfsNode[] | undefined;
    viewMode: "grid" | "list";
    openedFile: string | null;
    onItemClick: (item: VfsNode) => void;
}) {

    const [contextMenu, setContextMenu] = React.useState<{
        x: number;
        y: number;
        item: VfsNode;
    } | null>(null);

    function displayContextMenu(x: number, y: number, item: VfsNode) {
        const menuWidth = 140;
        const menuHeight = 120;
        let correctedX = x - ( menuWidth / 5 );
        let correctedY = y - ( menuHeight / 7 );
        if (correctedX + menuWidth > window.innerWidth) correctedX = window.innerWidth - menuWidth - 8;
        if (correctedY + menuHeight > window.innerHeight) correctedY = window.innerHeight - menuHeight - 8;
        setContextMenu({ x: correctedX, y: correctedY, item });
    }

    function handleContextMenu(
        e: React.MouseEvent,
        item: VfsNode
    ) {
        e.preventDefault();
        displayContextMenu(e.clientX, e.clientY, item)
    }

    const pressTimer = React.useRef<number | null>(null);
    const pressStart = React.useRef<{ x: number; y: number } | null>(null);
    const longPressFired = React.useRef(false);

    function handleTouchStart(e: React.TouchEvent, item: VfsNode) {
        const touch = e.touches[0];
        pressStart.current = { x: touch.clientX, y: touch.clientY };
        longPressFired.current = false;
        pressTimer.current = window.setTimeout(() => {
            longPressFired.current = true;
            if (navigator.vibrate) navigator.vibrate(15);
            displayContextMenu(touch.clientX, touch.clientY, item);
        }, 500);
    }

    function handleTouchMove(e: React.TouchEvent) {
        if (!pressStart.current || pressTimer.current === null) return;
        const touch = e.touches[0];
        const dx = Math.abs(touch.clientX - pressStart.current.x);
        const dy = Math.abs(touch.clientY - pressStart.current.y);
        if (dx > 10 || dy > 10) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
    }

    function handleTouchEnd(e: React.TouchEvent) {
        if (pressTimer.current !== null) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
        if (longPressFired.current) {
            e.preventDefault();
        }
    }

    if (viewMode === "list") {
        return (
            <div className="list-column themed-scrollbar">
                <div className="list-header">
                    <span></span>
                    <span>name</span>
                    <span>last updated</span>
                </div>

                {items?.map((item) => (
                    <div
                        key={item.slug}
                        className="list-row"
                        onClick={() => onItemClick(item)}
                        onContextMenu={(e) => handleContextMenu(e, item)}
                        onTouchStart={(e) => handleTouchStart(e, item)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <span className="list-row-icon">
                            {item.type === "folder" ? "📁" : item.cv ? "📃" : "📄"}
                        </span>

                        <span className="list-row-name">
                            {item.name}
                        </span>

                        <span className="list-row-date">
                            { item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "—" }
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
                {items?.map((item) => (
                    <ExplorerItem
                        key={item.slug}
                        item={item}
                        onClick={() => onItemClick(item)}
                        onTouchStart={(e) => handleTouchStart(e, item)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onContextMenu={(e) => handleContextMenu(e, item)}
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