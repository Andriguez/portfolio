import { useState } from "react";
import type { VfsFolder } from "../../types/vfs";
import type { useVfs } from "../../hooks/useVfs";
import {ChevronRight, ChevronDown, Folder, ComputerIcon, House, Trash2, KeyRound, FileUser} from "lucide-react";
import { useSite } from "../../context/SiteDataContext";

type TreeVfs = ReturnType<typeof useVfs>;

function TreeNode({
                      node, pathSoFar, depth, vfs, expandedPaths, setExpandedPaths
                  }: {
    node: VfsFolder; pathSoFar: string; depth: number; vfs: TreeVfs;
    expandedPaths: Set<string>; setExpandedPaths: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
    const nodePath = pathSoFar ? `${pathSoFar}/${node.slug}` : node.slug;
    const isExpanded = expandedPaths.has(nodePath);
    const childFolders = (node.children ?? []).filter((c): c is VfsFolder => c.type === "folder");

    function toggleExpand(e: React.MouseEvent) {
        e.stopPropagation();
        setExpandedPaths((prev) => {
            const next = new Set(prev);
            next.has(nodePath) ? next.delete(nodePath) : next.add(nodePath);
            return next;
        });
    }

    const isActive = vfs.currentPath === `/${nodePath}`;

    return (
        <div>
            <div
                className={`tree-row ${isActive ? "tree-row--active" : ""}`}
                style={{ paddingLeft: `${depth * 1.1}rem` }}
                onClick={() => vfs.goToPath(nodePath.split("/"))}
            >
                <span className="tree-disclosure" onClick={toggleExpand}>
                    {childFolders.length > 0
                        ? (isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />)
                        : <span style={{ display: "inline-block", width: 13 }} />}
                </span>
                <Folder size={14} className="tree-folder-icon" />
                <span className="tree-label">{node.name}</span>
            </div>
            {isExpanded && childFolders.map((child) => (
                <TreeNode key={child.slug} node={child} pathSoFar={nodePath} depth={depth + 1}
                          vfs={vfs} expandedPaths={expandedPaths} setExpandedPaths={setExpandedPaths} />
            ))}
        </div>
    );
}

export function TreeColumn({
                               vfs, expandedPaths, setExpandedPaths, onLoginClick
                           }: {
    vfs: TreeVfs; expandedPaths: Set<string>; setExpandedPaths: React.Dispatch<React.SetStateAction<Set<string>>>;
    onLoginClick: () => void;
}) {
    const { data: site } = useSite();
    const [pcExpanded, setPcExpanded] = useState(true);

    const rootFolder = vfs.root
    return (
        <div className="tree-column themed-scrollbar">
            <div className="tree-row tree-row--pcn" onClick={() => setPcExpanded((v) => !v)}>
                <span title="This PC" className="tree-disclosure">{pcExpanded ? "▾" : "▸"}</span>
                <ComputerIcon size={15} />
                <span className="tree-label">ANDRIGUEZ</span>
            </div>
            {pcExpanded && (
                <div className="tree-pc-contents">
                    <div className={`tree-row ${vfs.currentPath === "/" && !vfs.place ? "tree-row--active" : ""}`} onClick={() => vfs.goToPath([])}>
                        <span className="tree-disclosure" />
                        <House className="tree-folder-icon" size={15} />
                        <span className="tree-label">home</span>
                    </div>
                    {rootFolder?.children?.filter((c) => c.type === "folder").map((child) => (
                        <TreeNode key={child.slug} node={child as VfsFolder} pathSoFar="" depth={1}
                                  vfs={vfs} expandedPaths={expandedPaths} setExpandedPaths={setExpandedPaths} />
                    ))}
                </div>
            )}
            
            {site.cvs.length > 0 && (
                <div className={`tree-row tree-row--pcn ${vfs.place === "my-cv" ? "tree-row--active" : ""}`} onClick={() => vfs.goToPlace("my-cv")}>
                    <FileUser size={15} />
                    <span className="tree-label">My CV</span>
                </div>
            )}
            <div className="tree-row tree-row--pcn">
                <Trash2 size={15} />
                <span className="tree-label">Trash</span>
            </div>
            <div className="tree-row tree-row--pcn" onClick={onLoginClick}>
                <KeyRound size={15} />
                <span className="tree-label">Login</span>
            </div>

        </div>
    );
}