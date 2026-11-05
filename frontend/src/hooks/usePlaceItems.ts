import { useMemo } from "react";
import { CV_PLACE, TRASH_PLACE, useVfs } from "./useVfs.ts"
import { useTrash } from "./useTrash.ts";
import { cvToNode } from "../helpers/cvNodes.ts";
import { trashToNode } from "../helpers/trashNodes.ts";
import type { VfsNode } from "../types/vfs.ts";
import type { SiteData } from "./useSiteData.ts";

export function usePlaceItems(vfs:  ReturnType<typeof useVfs>, site: SiteData) {

    const inCv = vfs.place === CV_PLACE;
    const cvNodes = useMemo(() => site.cvs.map(cvToNode), [site.cvs]);
    const hasCv = site.cvs.length > 0;
    
    const inTrash = vfs.place === TRASH_PLACE;
    const { items: trashItems, source: trashSource } = useTrash(inTrash);
    const trashNodes = useMemo(() => trashItems.map(trashToNode), [trashItems]);
    
    const nodes = inCv ? cvNodes : inTrash ? trashNodes : null;
    const label = inCv ? "My CV" : inTrash ? "Trash" : null;
    const items: VfsNode[] = nodes ?? (vfs.currentFolder?.children ?? []);
    
    return { items, hasCv, trashSource,  label, nodes}
}