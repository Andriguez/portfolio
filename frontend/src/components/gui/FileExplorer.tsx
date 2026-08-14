import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

 import { useVfs } from "../../hooks/useVfs"
import { ExplorerButtons } from './ExplorerButtons';
import { TreeColumn } from "./TreeColumn";
import { GridColumn } from "./GridColumn";
import { DetailPanel } from "./DetailPanel";

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

    const items = vfs.currentFolder.children;
    const folderCount = items.filter((i) => i.type === "folder").length;
    const fileCount = items.length - folderCount;

    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    const visibleItems = vfs.currentFolder.children.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <div className="gui">
                <div className="gui-titlebar">
                    <span>portfolio</span>
                    <ExplorerButtons />
                </div>
                <div className="gui-toolbar">
                    <button className="toolbar-btn nav-btn" onClick={() => navigate(-1)} aria-label="back">‹</button>
                    <button className="toolbar-btn nav-btn" onClick={() => navigate(1)} aria-label="forward">›</button>

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
                        placeholder="search this page..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="toolbar-btn search-btn" onClick={() => {}} aria-label="search">🔍︎︎</button>

                    <div className="toolbar-menu">
                        <button className="toolbar-btn menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="menu">⋮</button>
                        {menuOpen && (
                            <div className="toolbar-menu-dropdown">
                                <div className="menu-item" onClick={() => setMenuOpen(false)}>theme: green / amber</div>
                                <div className="menu-item" onClick={() => setMenuOpen(false)}>sort by: name / date</div>
                                <div className="menu-item" onClick={() => setMenuOpen(false)}>about andi.sys</div>
                            </div>
                        )}
                    </div>

                </div>
                <div className="gui-body">
                    <TreeColumn vfs={vfs} expandedPaths={expandedPaths} setExpandedPaths={setExpandedPaths} />
                    <GridColumn vfs={vfs} onOpenFile={handleOpenFile} items={visibleItems} viewMode={viewMode} />
                    {openFile && (
                        <div className="detail-overlay-wrap">
                        <div className="detail-backdrop" onClick={handleCloseFile} />
                            <DetailPanel file={openFile} onClose={handleCloseFile} />
                        </div>
                    )}
                </div>
                <div className="gui-statusbar">
                        <span>{items.length} items | { folderCount > 0 ? `${folderCount} folder(s)` : "" }  {fileCount > 0 ? `${fileCount} file(s)` : "" } | </span>
                    <div className="view-toggle">
                        <button className={viewMode === "grid" ? "view-btn view-btn--active" : "view-btn"} onClick={() => setViewMode("grid")} aria-label="grid view">⊞</button>
                        <button className={viewMode === "list" ? "view-btn view-btn--active" : "view-btn"} onClick={() => setViewMode("list")} aria-label="list view">☰</button>
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
        </div>
    )
}