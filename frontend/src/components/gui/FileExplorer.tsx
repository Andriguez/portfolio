import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import changelog from "../../../CHANGELOG.md?raw";

import { useVfs, searchVfs } from "../../hooks/useVfs"
import { ExplorerButtons } from './ExplorerButtons';
import { TreeColumn } from "./TreeColumn";
import { GridColumn } from "./GridColumn";
import { DetailPanel } from "./DetailPanel";
import { ExternalLink } from "lucide-react";
import { useSite } from "../../context/SiteDataContext.tsx";
import { cvToNode } from "../../helpers/cvNodes.ts";
import type {VfsFile, VfsNode} from "../../types/vfs.ts";
import {ThemeToggle} from "./ThemeToggle.tsx";
import {useTheme} from "../../hooks/useTheme.ts";
import {DesktopIcons} from "./DesktopIcons.tsx";
import {LoginModal} from "./LoginModal.tsx";
import { InfoDialog } from "./InfoDialog.tsx";

export function FileExplorer( {vfs}: { vfs: ReturnType<typeof useVfs>}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

    const {theme, toggleTheme} = useTheme();

    const [loginOpen, setLoginOpen] = useState(false);

    const { data: site } = useSite();
    
    const inCv = vfs.place === "my-cv";
    const cvNodes = useMemo(() => site.cvs.map(cvToNode), [site.cvs]);

    const openSlug = searchParams.get("open");
    const openFile = openSlug
        ? ((inCv ? cvNodes.find((n) => n.slug === openSlug) : vfs.resolveFile(openSlug)) ?? null)
        : null;

    const items: VfsNode[] = inCv ? cvNodes : (vfs.currentFolder?.children ?? []);
    const hasCv = site.cvs.length > 0;

    const [aboutOpen, setAboutOpen] = useState(false);
    const [changelogOpen, setChangelogOpen] = useState(false);

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

    function handleOpenFile(slug: string) { 
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("open", slug);
            return next;
        });
    }

    function handleCloseFile() {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete("open");
            return next;
        }, { replace: true });
    }

    function handleCvIcon() { vfs.goToPlace("my-cv"); handleRestoreWindow(); }

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

                    <div className="address-field themed-scrollbar">
                        {inCv ? (
                            <span className="crumb-pill">My CV</span>
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
                            aria-label="search">
                        🔍︎︎
                    </button>

                    <div className="toolbar-menu">
                        <button title="options" className="toolbar-btn menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="menu">⋮</button>
                        {menuOpen && (
                            <div className="toolbar-menu-dropdown">
                                <div className="menu-item">
                                    <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                                </div>
                                <div className="menu-item" onClick={() => { setAboutOpen(true); setMenuOpen(false); }}>about andi.sys</div>
                                <div className="menu-item" onClick={() => { setChangelogOpen(true); setMenuOpen(false); }}>read changelog.md</div>

                                {hasCv && (
                                    <div className="menu-item menu-item--mobile-only" onClick={() => { vfs.goToPlace("my-cv"); setMenuOpen(false); }}>my cv</div>
                                )}
                                <div className="menu-item menu-item--mobile-only" onClick={() => { setLoginOpen(true); setMenuOpen(false); }}>login</div>
                                {site.links.length > 0 && <div className="menu-divider" />}
                                {site.links.map((l) => (
                                    <a key={l.id} className="menu-item menu-item--link" href={l.url} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>
                                        go to {l.name.toLowerCase()} <ExternalLink size={11} />
                                    </a>
                                ))}
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
                        <span title="content summary" >{items?.length} items | { folderCount > 0 ? `${folderCount} folder(s)` : "" }  {fileCount > 0 ? `${fileCount} file(s)` : "" } | </span>
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
             <div>
                <DesktopIcons onRestore={handleRestoreWindow} onLoginClick={() => setLoginOpen(true)} onCvClick={() => { if (hasCv) handleCvIcon(); }} />
                </div>
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