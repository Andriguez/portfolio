// src/data/trashFallback.ts
import type { TrashItem } from "../types/trash";

export const TRASH_FALLBACK: TrashItem[] = [
    { 
        name: "final_v2_FINAL_really.docx", size: "1.2 MB", hash: "02nd045",
        commit: "the other finals are in another folder.",
        preview: ["+ Final before deploying", "- test this function"],
        restoreError: "the codebase has moved on. so should you."
    },
    { 
        name: "TODO_later.md", size: "2.4 KB", hash: "r09po39a",
        commit: "later never came.", preview: ["+ // TO-DO: don't tell me what to do //", "- // TO-DO: stop over engineering."],
        restoreError: "the time is now!"
    },
    {
        name: "toy_terminal_v0.zip", size: "3.1 KB", hash: "1e0b7d4",
        commit: "first working cli (unstyled, but it worked)",
        preview: ["+ <div>{entry.output}</div>", "- the colors, the cursor, the soul"],
        restoreError: "restoring would undo three weeks of styling.",
    },
    {
        name: "python-jose/", size: "2.4 MB", hash: "7c5d9aa",
        commit: "jwt library (no fix versions listed)",
        preview: ["- from jose import jwt", "+ import jwt   # PyJWT"],
        restoreError: "pip-audit says no.",
    },
    {
        name: "scanline_infinite.css", size: "391 B", hash: "d41c0e8",
        commit: "add scanline (it never stops)",
        preview: ["- animation: sweep 9s linear infinite;", "+ animation: sweep 1.8s linear;"],
        restoreError: "it's still running somewhere. you can see it from here.",
    },
    {
        name: "works_on_my_machine.exe", size: "14 MB", hash: "0badf00",
        commit: "wip",
        preview: ["+ everything", "- documentation"],
        restoreError: "still running in production.",
    }
];