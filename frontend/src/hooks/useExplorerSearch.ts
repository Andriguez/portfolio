import { useState } from "react";
import { searchVfs } from "./useVfs.ts"
import type { VfsFolder, VfsNode } from "../types/vfs.ts";


export function useExplorerSearch(root: VfsFolder | null, items: VfsNode[]) {
    const [searchQuery, setSearchQuery] = useState("");
    const searchResults = searchQuery && root ? searchVfs(root, searchQuery) : null;
    const visibleItems = searchResults ? searchResults.map((r) => r.node) : items;
    
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    return {setSearchQuery, searchResults, visibleItems, mobileSearchOpen, setMobileSearchOpen, searchQuery }
}