import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import changelog from "../../../helpers/changelog.ts";

import { useVfs, CV_PLACE, TRASH_PLACE } from "../../../hooks/useVfs.ts"
import { ExplorerButtons } from './components/ExplorerButtons.tsx';
import { TreeColumn } from "./components/TreeColumn.tsx";
import { GridColumn } from "./components/GridColumn.tsx";
import { DetailPanel } from "./content-panels/DetailPanel.tsx";
import { ExternalLink, Mail, ListTree } from "lucide-react";
import type {VfsFile, VfsNode} from "../../../types/vfs.ts";
import {ThemeToggle} from "./components/ThemeToggle.tsx";
import {DesktopIcons} from "../DesktopIcons.tsx";
import {LoginModal} from "../modals/LoginModal.tsx";
import { InfoDialog } from "../modals/InfoDialog.tsx";
import { useContextClose } from "../../../hooks/useContextClose.ts";
import { useWindowState } from "../../../hooks/useWindowState.ts";
import { useExplorerSearch } from "../../../hooks/useExplorerSearch.ts";
import { usePlaceItems } from "../../../hooks/usePlaceItems.ts";
import { useSite } from "../../../context/SiteDataContext.ts";
import { useOpenFile } from "../../../hooks/useOpenFile.ts";
import { useNavigate } from "react-router-dom";
import { useExpandedPaths } from "../../../hooks/useExpandedPaths.ts";


export function FileExplorer( {vfs}: { vfs: ReturnType<typeof useVfs>}) {
    const navigate = useNavigate();
    
    const { expandedPaths, setExpandedPaths } = useExpandedPaths()
    const [loginOpen, setLoginOpen] = useState(false);

    const { data: site } = useSite();
    
    const place = usePlaceItems(vfs, site);
    const fileAction = useOpenFile(vfs, place.nodes)

    const [aboutOpen, setAboutOpen] = useState(false);
    const [changelogOpen, setChangelogOpen] = useState(false);

    const win = useWindowState()

    function handleCvIcon() { vfs.goToPlace(CV_PLACE); win.restore(); }

    const folderCount = place.items?.filter((i) => i.type === "folder").length;
    const fileCount = place.items?.filter((i) => i.type === "file").length;

    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [treeOpen, setTreeOpen] = useState(false);
   
    useContextClose(menuOpen, () => setMenuOpen(false), (t) => !!menuRef.current?.contains(t));
    useContextClose(treeOpen, () => setTreeOpen(false), (t) => t instanceof Element && !!t.closest(".tree-drawer, .tree-toggle"))

    const search = useExplorerSearch(vfs.root, place.items);

    function handleItemClick(item: VfsNode) {
        if (search.searchResults) {
            const match = search.searchResults.find((r) => r.node === item);
            if (!match) return;
            if (item.type === "folder") {
                vfs.goToPath(match.path);
            } else {
                navigate(`/${match.path.slice(0, -1).join("/")}?open=${item.slug}`);
            }
            search.setSearchQuery("");
            return;
        }

        if (item.type === "folder") vfs.cd(item.slug)
        else fileAction.open(item.slug);
    }

    const navKey = `${vfs.currentPath}|${vfs.place ?? ""}`;
    const [lastNavKey, setLastNavKey] = useState(navKey);
    if (lastNavKey !== navKey) {
        setLastNavKey(navKey);
        setTreeOpen(false);
    }

        return (
        <div>
            <div className={`gui ${win.guiClassName}`}
            >

                <div className="gui-titlebar">
                    <span>portfolio</span>
                    <ExplorerButtons onMinimize={win.minimize} onClose={win.close} />
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
                        {place.label ? (
                            <span className="crumb-pill">{place.label}</span>
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
                        value={search.searchQuery}
                        onChange={(e) => search.setSearchQuery(e.target.value)}
                    />

                    <button className="toolbar-btn search-btn"
                            onClick={() => search.setMobileSearchOpen((v) => !v)}
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
                    {search.mobileSearchOpen && (
                        <div className="mobile-search-row">
                            <input
                                className="mobile-search-input"
                                autoFocus
                                placeholder="search.."
                                value={search.searchQuery}
                                onChange={(e) => search.setSearchQuery(e.target.value)}
                            />
                            <button className="toolbar-btn search-btn"
                                    onClick={() => search.setMobileSearchOpen((v) => !v)}
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
                                    onLoginClick={
                                        () => { 
                                            setTreeOpen(false); setLoginOpen(true); 
                                        }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="gui-body">
                        <TreeColumn 
                            vfs={vfs} 
                            expandedPaths={expandedPaths} 
                            setExpandedPaths={setExpandedPaths}
                            onLoginClick={() => setLoginOpen(true)} 
                        />
                        <GridColumn 
                            vfs={vfs}
                            items={search.visibleItems}
                            viewMode={viewMode}
                            openedFile={fileAction.openSlug}
                            onItemClick={handleItemClick} 
                        />
                        {fileAction.openFile && (
                            <div className="detail-overlay-wrap">
                            <div className="detail-backdrop" onClick={fileAction.close} />
                                <DetailPanel file={fileAction.openFile as VfsFile} onClose={fileAction.close} />
                            </div>
                        )}
                    </div>
                    <div className="gui-statusbar">
                            <span title="content summary" >
                                {search.visibleItems?.length} item(s) | 
                                { !search.searchQuery && folderCount > 0 ? ` ${folderCount} folder(s)` : "" } 
                                 {
                                    !search.searchQuery && fileCount > 0 && vfs.place !== TRASH_PLACE ? ` ${fileCount} file(s)` 
                                    : vfs.place === TRASH_PLACE ? ` $ git log --diff-filter=D · ${place.trashSource === "loading" ? "loading..." 
                                    : place.trashSource === "github" ? "from git history" : "from archives"}` 
                                 : "" 
                                 } 
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
                { win.state === "open" && (
                <div className="gui-desktop-overlay" >
                    </div>
                )}
                { win.state === "minimized" && (
                        <div title="Start" className="gui-taskbar-pill" onClick={win.restore} />
                )}
                {
                    !win.shuttingDown && (
                    <div>
                    <DesktopIcons onRestore={() => { vfs.goToPath([]); win.restore(); }} onLoginClick={() => setLoginOpen(true)} onCvClick={() => { if (place.hasCv) handleCvIcon(); }} onTrashClick={() => {vfs.goToPlace(TRASH_PLACE); win.restore(); }} />
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