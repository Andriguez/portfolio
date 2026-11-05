import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import changelog from "../../../helpers/changelog.ts";

import { useVfs, searchVfs, CV_PLACE, TRASH_PLACE } from "../../../hooks/useVfs.ts"
import { ExplorerButtons } from './components/ExplorerButtons.tsx';
import { TreeColumn } from "./components/TreeColumn.tsx";
import { GridColumn } from "./components/GridColumn.tsx";
import { DetailPanel } from "./content-panels/DetailPanel.tsx";
import { ExternalLink, Mail, ListTree } from "lucide-react";
import { useSite } from "../../../context/SiteDataContext.ts";
import { useTrash } from "../../../hooks/useTrash.ts";
import { trashToNode } from "../../../helpers/trashNodes.ts";
import { cvToNode } from "../../../helpers/cvNodes.ts";
import type {VfsFile, VfsNode} from "../../../types/vfs.ts";
import {ThemeToggle} from "./components/ThemeToggle.tsx";
import {DesktopIcons} from "../DesktopIcons.tsx";
import {LoginModal} from "../modals/LoginModal.tsx";
import { InfoDialog } from "../modals/InfoDialog.tsx";

export function FileExplorer( {vfs}: { vfs: ReturnType<typeof useVfs>}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
    const [syncedPath, setSyncedPath] = useState(vfs.currentPath);

    const [loginOpen, setLoginOpen] = useState(false);

    const { data: site } = useSite();
    
    const inCv = vfs.place === CV_PLACE;
    const cvNodes = useMemo(() => site.cvs.map(cvToNode), [site.cvs]);
    const hasCv = site.cvs.length > 0;


    const inTrash = vfs.place === TRASH_PLACE;
    const { items: trashItems, source: trashSource } = useTrash(inTrash);
    const trashNodes = useMemo(() => trashItems.map(trashToNode), [trashItems]);

    const placeNodes = inCv ? cvNodes : inTrash ? trashNodes : null;
    const placeLabel = inCv ? "My CV" : inTrash ? "Trash" : null;

    const openSlug = searchParams.get("open");
    const openFile = openSlug
    ? ((placeNodes ? placeNodes.find((n) => n.slug === openSlug) : vfs.resolveFile(openSlug)) ?? null)
    : null;
    const items: VfsNode[] = placeNodes ?? (vfs.currentFolder?.children ?? []);


    const [aboutOpen, setAboutOpen] = useState(false);
    const [changelogOpen, setChangelogOpen] = useState(false);


    if (syncedPath !== vfs.currentPath) {
        setSyncedPath(vfs.currentPath);
        setExpandedPaths((prev) => {
            const next = new Set(prev);
            let acc = "";
            for (const part of vfs.pathParts) {
                acc = acc ? `${acc}/${part}` : part;
                next.add(acc);
            }
            return next;
        });
    }

    function handleOpenFile(slug: string) { 
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("open", slug);
            return next;
        });
    }

    const handleCloseFile = useCallback(() => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete("open");
            return next;
        }, { replace: true });
    }, [setSearchParams]);

    function handleCvIcon() { vfs.goToPlace(CV_PLACE); handleRestoreWindow(); }

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

    const folderCount = items?.filter((i) => i.type === "folder").length;
    const fileCount = items?.filter((i) => i.type === "file").length;

    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!menuOpen) return;

        function handlePointerDown(e: PointerEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }

        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") setMenuOpen(false);
        }

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKey);
        }
    }, [menuOpen])

    const searchResults = searchQuery && vfs.root ? searchVfs(vfs.root, searchQuery) : null;
    const visibleItems = searchResults ? searchResults.map((r) => r.node) : items;

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

    const [treeOpen, setTreeOpen] = useState(false);
    const navKey = `${vfs.currentPath}|${vfs.place ?? ""}`;
    const [lastNavKey, setLastNavKey] = useState(navKey);
    if (lastNavKey !== navKey) {
        setLastNavKey(navKey);
        setTreeOpen(false);
    }

    useEffect(() => {
        if (!treeOpen) return;
        function onPointerDown(e: PointerEvent) {
            if (!(e.target as HTMLElement).closest(".tree-drawer, .tree-toggle")) setTreeOpen(false);
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setTreeOpen(false);
        }
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [treeOpen]);

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
                    <button
                        className="toolbar-btn tree-toggle"
                        title="folders"
                        aria-label="show all folders"
                        aria-expanded={treeOpen}
                        onClick={() => setTreeOpen((v) => !v)}
                    >
                        <ListTree size={14} />
                    </button>
                    <button title="back" className="toolbar-btn nav-btn" onClick={() => navigate(-1)} aria-label="back">‹</button>
                    <button title="forward" className="toolbar-btn nav-btn" onClick={() => navigate(1)} aria-label="forward">›</button>

                    <div className="address-field themed-scrollbar">
                        {placeLabel ? (
                            <span className="crumb-pill">{placeLabel}</span>
                        ) : (
                            <>
                                <span className="crumb-pill" onClick={() => vfs.goToPath([])}>home</span>
                                {vfs.pathParts.map((part, i) => (
                                    <span key={i}>
                                        <span className="crumb-sep">{">"}</span>
                                        <span className="crumb-pill" onClick={() => vfs.goToPath(vfs.pathParts.slice(0, i + 1))}>{part}</span>
                                    </span>
                                ))}
                            </>
                        )}
                    </div>

                    <input
                        className="search-field"
                        placeholder="search.."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <button className="toolbar-btn search-btn"
                            onClick={() => setMobileSearchOpen((v) => !v)}
                            aria-label="search"
                            style={{fontSize: "12px"}}>
                        🔍︎
                    </button>

                    <div className="toolbar-menu" ref={menuRef}>
                        <button title="options" className="toolbar-btn menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="menu">⋮</button>
                        {menuOpen && (
                            <div className="toolbar-menu-dropdown">
                                <div className="menu-item">
                                    <ThemeToggle />
                                </div>
                                <div className="menu-item" onClick={() => { setAboutOpen(true); }}>about andi.sys</div>
                                <div className="menu-item" onClick={() => { setChangelogOpen(true); }}>read changelog.md</div>

                                {site.links.length > 0 && <div className="menu-divider" />}
                                {site.links.map((l) => (
                                    <a key={l.id} className="menu-item menu-item--link" href={l.url} target="_blank" rel="noopener noreferrer">
                                        go to {l.name.toLowerCase()} <ExternalLink size={11} />
                                    </a>
                                ))}
                                <a key={"email"} className="menu-item menu-item--link" href="mailto:contact@andriguez.dev">
                                    send me an email <Mail size={11} />
                                </a>
                            </div>
                        )}
                    </div>

                    </div>
                    {mobileSearchOpen && (
                        <div className="mobile-search-row">
                            <input
                                className="mobile-search-input"
                                autoFocus
                                placeholder="search.."
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
                    {treeOpen && (
                        <div className="tree-drawer-anchor">
                            <div className="tree-drawer">
                                <TreeColumn
                                    vfs={vfs}
                                    expandedPaths={expandedPaths}
                                    setExpandedPaths={setExpandedPaths}
                                    onLoginClick={() => { setTreeOpen(false); setLoginOpen(true); }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="gui-body">
                        <TreeColumn vfs={vfs} expandedPaths={expandedPaths} setExpandedPaths={setExpandedPaths} onLoginClick={() => setLoginOpen(true)} />
                        <GridColumn vfs={vfs} items={visibleItems} viewMode={viewMode} openedFile={openSlug} onItemClick={handleItemClick} />
                        {openFile && (
                            <div className="detail-overlay-wrap">
                            <div className="detail-backdrop" onClick={handleCloseFile} />
                                <DetailPanel file={openFile as VfsFile} onClose={handleCloseFile} />
                            </div>
                        )}
                    </div>
                    <div className="gui-statusbar">
                            <span title="content summary" >
                                {items?.length} items | 
                                { folderCount > 0 ? ` ${folderCount} folder(s)` : "" }  {fileCount > 0 && vfs.place !== TRASH_PLACE ? `${fileCount} file(s)` : vfs.place === TRASH_PLACE ? `$ git log --diff-filter=D · ${trashSource === "loading" ? "loading..." : trashSource === "github" ? "from git history" : "from archives"}` : "" } 
                            </span>
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
                { windowState === "open" && (
                <div className="gui-desktop-overlay" >
                    </div>
                )}
                { windowState === "minimized" && (
                        <div title="Start" className="gui-taskbar-pill" onClick={handleRestoreWindow} />
                )}
                {
                    !shuttingDown && (
                    <div>
                    <DesktopIcons onRestore={() => { vfs.goToPath(["/"]); handleRestoreWindow(); }} onLoginClick={() => setLoginOpen(true)} onCvClick={() => { if (hasCv) handleCvIcon(); }} onTrashClick={() => {vfs.goToPlace(TRASH_PLACE); handleRestoreWindow(); }} />
                    </div>
                )
                }
                <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
                <InfoDialog open={aboutOpen} onOpenChange={setAboutOpen} title="about andi.sys">
                    <p className="info-text">{site.staticContent.stack_info || "nothing written here yet."}</p>
                </InfoDialog>
                <InfoDialog open={changelogOpen} onOpenChange={setChangelogOpen} title="changelog.md">
                    <div className="info-markdown"><ReactMarkdown>{changelog}</ReactMarkdown></div>
                </InfoDialog>
            </div>
        )
}