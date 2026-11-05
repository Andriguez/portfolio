import { useState } from "react";
import { useVfs } from "./useVfs";

export function useExpandedPaths() {
    const vfs = useVfs();
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
    const [syncedPath, setSyncedPath] = useState(vfs.currentPath);

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
    
    return { expandedPaths, setExpandedPaths, syncedPath, setSyncedPath }
}