import { useState } from "react";
import type { VfsFile } from "../../types/vfs";
import { useVfs } from "../../hooks/useVfs"
import { ExplorerButtons } from './ExplorerButtons';
import { ExplorerBreadcrumbs } from './ExplorerBreadcrumbs';
import { ExplorerItem } from './ExplorerItem';

export function FileExplorer( {vfs}: { vfs: ReturnType<typeof useVfs>}) {
    const { currentFolder, currentPath, cd } = vfs;

    const [ openFile, setOpenFile ] = useState<VfsFile | null>(null);

    function handleClick(item: (typeof currentFolder.children)[number]) {
        if (item.type === "folder") {
            cd(item.slug);
        } else {
            setOpenFile(item);
        }
    }

    return (
        <div>
            <div className="gui">
                <div className="gui-titlebar">
                    <span>portfolio</span>
                    <ExplorerButtons />
                </div>
                <div className="gui-body">
                    <ExplorerBreadcrumbs currentPath={currentPath} cd={cd} />
                    <div className="gui-grid">
                        { currentFolder.children.map((item) => (
                            <ExplorerItem
                                item={item}
                                onClick={() => handleClick(item)}
                            />
                        ))}
                    </div>
                    { openFile &&
                    <div className="gui-dialog">
                        <div className="gui-dialog-title">{ openFile?.content.title }</div>
                        <img src={openFile?.content.image} alt={openFile.content.title} style={{ width: "50%", height: "50%" }} />
                        <div className="gui-dialog-body"> { openFile?.content.body } </div>
                    </div>
                    }
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