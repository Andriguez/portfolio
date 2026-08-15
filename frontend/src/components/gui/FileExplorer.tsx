import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

 import { useVfs, searchVfs } from "../../hooks/useVfs"
import { ExplorerButtons } from './ExplorerButtons';
import { TreeColumn } from "./TreeColumn";
import { GridColumn } from "./GridColumn";
import { DetailPanel } from "./DetailPanel";
import type {VfsNode} from "../../types/vfs.ts";

export function FileExplorer( {vfs}: { vfs: ReturnType<typeof useVfs>}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const openSlug = searchParams.get("open");
    const openFile = openSlug ? vfs.resolveFile(openSlug) : null;

    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

    useEffect(() => {
        setExpandedPaths((prev) => {
            const next = new Set(prev);
            let acc = "";
            for (const part of vfs.pathParts) {
                acc = acc ? `${acc}/${part}` : part;
                next.add(acc)
            }
            return next
        })
    }, [vfs.currentPath, vfs.pathParts]);

    function handleOpenFile(slug: string) { setSearchParams({ open: slug }); }

    function handleCloseFile() { navigate(-1); }

    useEffect(() => {
        if (!openFile) return;
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") handleCloseFile();
        }
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [openFile, handleCloseFile]);

    type WindowState = "open" | "minimizing" | "minimized" | "restoring";
    const [windowState, setWindowState] = useState<WindowState>("open");

    function handleMinimizeWindow() {
        setWindowState("minimizing");
        setTimeout(() => setWindowState("minimized"), 320);
    }
    function handleRestoreWindow() {
        setWindowState("restoring");
        setTimeout(() => setWindowState("open"), 320);
    }

    const [shuttingDown, setShuttingDown] = useState(false);

    function handleCloseWindow() {
        setShuttingDown(true);
        setTimeout(() => window.close(), 500);
    }

    const items = vfs.currentFolder.children;
    const folderCount = items.filter((i) => i.type === "folder").length;
    const fileCount = items.length - folderCount;

    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    const searchResults = searchQuery ? searchVfs(searchQuery) : null;
    const visibleItems = searchResults ? searchResults.map((r) => r.node) : vfs.currentFolder.children;

    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    function handleItemClick(item: VfsNode) {
        if (searchResults) {
            const match = searchResults.find((r) => r.node === item);
            if (!match) return;
            if (item.type === "folder") {
                vfs.goToPath(match.path);
            } else {
                navigate(`/${match.path.slice(0, -1).join("/")}?open=${item.slug}`);
            }
            setSearchQuery("");
            return;
        }

        if (item.type === "folder") vfs.cd(item.slug)
        else handleOpenFile(item.slug);
    }

    return (
        <div>
            <div className={`gui ${
                windowState === "minimizing" ? "gui-window--minimizing"
                    : windowState === "minimized" ? "gui-window--hidden"
                        : windowState === "restoring" ? "gui-window--restoring"
                            : ""
                } ${shuttingDown ? "cli-power-off" : ""}`}
            >

                <div className="gui-titlebar">
                    <span>portfolio</span>
                    <ExplorerButtons onMinimize={handleMinimizeWindow} onClose={handleCloseWindow} />
                </div>
                <div className="gui-toolbar">
                    <button title="back" className="toolbar-btn nav-btn" onClick={() => navigate(-1)} aria-label="back">‹</button>
                    <button title="forward" className="toolbar-btn nav-btn" onClick={() => navigate(1)} aria-label="forward">›</button>

                    <div className="address-field">
                        <span className="crumb-pill" onClick={() => vfs.goToPath([])}>home</span>
                        {vfs.pathParts.map((part, i) => (
                            <span key={i}>
                            <span className="crumb-sep">{">"}</span>
                            <span className="crumb-pill" onClick={() => vfs.goToPath(vfs.pathParts.slice(0, i + 1))}>{part}</span>
                             </span>
                        ))}
                    </div>

                    <input
                        className="search-field"
                        placeholder="search it.."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <button className="toolbar-btn search-btn"
                            onClick={() => setMobileSearchOpen((v) => !v)}
                            aria-label="search">
                        🔍︎︎
                    </button>

                    <div className="toolbar-menu">
                        <button title="options" className="toolbar-btn menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="menu">⋮</button>
                        {menuOpen && (
                            <div className="toolbar-menu-dropdown">
                                <div className="menu-item" onClick={() => setMenuOpen(false)}>theme: green / amber</div>
                                <div className="menu-item" onClick={() => setMenuOpen(false)}>sort by: name / date</div>
                                <div className="menu-item" onClick={() => setMenuOpen(false)}>about andi.sys</div>
                            </div>
                        )}
                    </div>

                </div>
                {mobileSearchOpen && (
                    <div className="mobile-search-row">
                        <input
                            className="mobile-search-input"
                            autoFocus
                            placeholder="search it.."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="toolbar-btn search-btn"
                                onClick={() => setMobileSearchOpen((v) => !v)}
                                aria-label="search">
                            ×
                        </button>
                    </div>
                )}
                <div className="gui-body">
                    <TreeColumn vfs={vfs} expandedPaths={expandedPaths} setExpandedPaths={setExpandedPaths} />
                    <GridColumn vfs={vfs} onOpenFile={handleOpenFile} items={visibleItems} viewMode={viewMode} openedFile={openSlug} onItemClick={handleItemClick} />
                    {openFile && (
                        <div className="detail-overlay-wrap">
                        <div className="detail-backdrop" onClick={handleCloseFile} />
                            <DetailPanel file={openFile} onClose={handleCloseFile} />
                        </div>
                    )}
                </div>
                <div className="gui-statusbar">
                        <span title="content summary" >{items.length} items | { folderCount > 0 ? `${folderCount} folder(s)` : "" }  {fileCount > 0 ? `${fileCount} file(s)` : "" } | </span>
                    <div className="view-toggle">
                        <button title="grid view" className={viewMode === "grid" ? "view-btn view-btn--active" : "view-btn"} onClick={() => setViewMode("grid")} aria-label="grid view">⊞</button>
                        <button title="list view" className={viewMode === "list" ? "view-btn view-btn--active" : "view-btn"} onClick={() => setViewMode("list")} aria-label="list view">☰</button>
                    </div>
                </div>
                <svg className="gui-grain" width="100%" height="100%">
                    <filter id="grain2">
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"
                                      stitchTiles="stitch"></feTurbulence>
                    </filter>
                    <rect width="100%" height="100%" filter="url(#grain2)"></rect>
                </svg>
            </div>
            { windowState === "minimized" && (
                <div className="gui-taskbar-pill" onClick={handleRestoreWindow}>
                    andi.sys — file explorer
                </div>
            )}
        </div>
    )
}