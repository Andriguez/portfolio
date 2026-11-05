import { useEffect, useRef, useState } from "react";

type WindowState = "open" | "minimizing" | "minimized" | "restoring";

export function useWindowState(animationMs = 320) {
    const [state, setState] = useState<WindowState>("open");
    const [shuttingDown, setShuttingDown] = useState(false);
    const timer = useRef<number | undefined>(undefined);

    useEffect(() => window.clearTimeout(timer.current), []);

    function later(fn: () => void, ms: number) {
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(fn, ms);
    }
    
    const minimize = () => {
        setState("minimizing");
        later(() => setState("minimized"), animationMs);
    };
    
    const restore = () => {
        setState("restoring");
        later(() => setState("open"), animationMs);
    };

    const close = () => {
        setShuttingDown(true);
        later(() => window.close(), 800);
    };

    const guiClassName = [
        state === "minimizing" && "gui-window--minimizing",
        state === "minimized" && "gui-window--hidden",
        state === "restoring" && "gui-window-restoring",
        shuttingDown && "cli-power-off",
    ].filter(Boolean).join(" ");

    return {
        state, 
        minimize, 
        close,
        restore,
        shuttingDown, 
        guiClassName
        }
}