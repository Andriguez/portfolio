import type { useVfs } from "../../../../hooks/useVfs.ts";
import type { VfsNode } from "../../../../types/vfs.ts";
import { ExplorerItem } from "./ExplorerItem.tsx";

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
                        openedFile={openedFile}
                    />
                ))}
            </div>
        </div>
    );
}