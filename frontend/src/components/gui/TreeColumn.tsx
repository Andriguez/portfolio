import { useState } from "react";
import type { VfsFolder } from "../../types/vfs";
import { root } from "../../data/vfs";
import type { useVfs } from "../../hooks/useVfs";
import {ChevronRight, ChevronDown, Folder, ComputerIcon, House} from "lucide-react";

type TreeVfs = ReturnType<typeof useVfs>;

function TreeNode({
                      node, pathSoFar, depth, vfs, expandedPaths, setExpandedPaths,
                  }: {
    node: VfsFolder; pathSoFar: string; depth: number; vfs: TreeVfs;
    expandedPaths: Set<string>; setExpandedPaths: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
    const nodePath = pathSoFar ? `${pathSoFar}/${node.slug}` : node.slug;
    const isExpanded = expandedPaths.has(nodePath);
    const isActive = vfs.currentPath === `/${nodePath}`;
    const childFolders = node.children.filter((c) => c.type === "folder") as VfsFolder[];


    function toggleExpand(e: React.MouseEvent) {
        e.stopPropagation(); // don't also navigate when just expanding
        setExpandedPaths((prev) => {
            const next = new Set(prev);
            next.has(nodePath) ? next.delete(nodePath) : next.add(nodePath);
            return next;
        });
    }

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
                               vfs, expandedPaths, setExpandedPaths,
                           }: {
    vfs: TreeVfs; expandedPaths: Set<string>; setExpandedPaths: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
    const [pcExpanded, setPcExpanded] = useState(true);

    const rootFolder = root as VfsFolder;
    return (
        <div className="tree-column themed-scrollbar">
            <div className="tree-row tree-row--pcn " onClick={() => setPcExpanded((v) => !v)}>
                <span className="tree-disclosure">{pcExpanded ? "▾" : "▸"}</span>
                <ComputerIcon size={15} />
                <span className="tree-label">ANDI-PC</span>
            </div>
            {pcExpanded && (
                <div className="tree-pc-contents">
                    <div className={`tree-row ${vfs.currentPath === "/" ? "tree-row--active" : ""}`} onClick={() => vfs.goToPath([])}>
                        <span className="tree-disclosure" />
                        <House className="tree-folder-icon" size={15} />
                        <span className="tree-label">home</span>
                    </div>
                    {rootFolder.children.filter((c) => c.type === "folder").map((child) => (
                        <TreeNode key={child.slug} node={child as VfsFolder} pathSoFar="" depth={1}
                                  vfs={vfs} expandedPaths={expandedPaths} setExpandedPaths={setExpandedPaths} />
                    ))}
                </div>
            )}
        </div>
    );
}