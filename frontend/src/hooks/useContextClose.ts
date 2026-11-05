import { useEffect, useRef } from "react";

export function useContextClose(open: boolean, close: () => void, isInside: (target: Node) => boolean) {

    const closeRef = useRef(close);
    const insideRef = useRef(isInside);

    useEffect(() => { closeRef.current = close; insideRef.current = isInside; })

    useEffect(() => {
        if (!open) return;
        function onPointerDown(e: PointerEvent) {
            if (!insideRef.current(e.target as Node)) closeRef.current();
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") closeRef.current();
        }
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

}