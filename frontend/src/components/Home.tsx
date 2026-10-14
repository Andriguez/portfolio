import { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Switch } from "radix-ui";
import { Terminal, Eye } from "lucide-react";
import { useVfs } from "../hooks/useVfs";
import { CliView } from "./cli/CliView";
import { GuiView } from "./gui/GuiView";

type Mode = "cli" | "gui";

export function Home() {
    const vfs = useVfs();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    const [initial] = useState(() => {
        const mode : Mode = searchParams.get("mode") === "gui" ? "gui" : "cli";
        const open = searchParams.get("open");
        let command: string | null = null;

        if (open) command = `cat "${open.replace(/"/g, "")}"`;
        else if (location.pathname.startsWith("/my-cv")) command = "cv";

        return {mode, command: mode === "cli" ? command: null}
    });
    
    const [mode, setMode] = useState<Mode>((initial.mode));

    const [ booted, setBooted ] = useState<boolean>(false);
    const [ shuttingDown, setShuttingDown ] = useState<boolean>(false);

    const [ glitchKey, setGlitchKey ] = useState(0);

    useEffect(() => {
        function scheduleGlitch() {
            const delay = 15000 + Math.random() * 30000; // 15–45s, never the same twice
            return setTimeout(() => {
                setGlitchKey((k) => k + 1);
                scheduleGlitch();
            }, delay);
        }
        const timeout = scheduleGlitch();
        return () => clearTimeout(timeout);
    }, []);

    const [ scanKey, setScanKey ] = useState(0);
    const [scanReverse, setScanReverse] = useState(false);

    useEffect(() => {
        function scheduleScan() {
            const delay = 2000 + Math.random() * 6000;
            return setTimeout(() => {
                setScanReverse(Math.random() > 0.4);
                setScanKey((k) => k + 1);
                scheduleScan();
            }, delay);
        }
        const timeout = scheduleScan();
        return () => clearTimeout(timeout);
    }, []);

    const [uptimeSeconds, setUptimeSeconds] = useState(0);

    useEffect(() => {
        if (!booted) return;
        const interval = setInterval(() => setUptimeSeconds((s) => s + 1), 1000);
        return () => clearInterval(interval);
    }, [booted]);

    function formatUptime(total: number) {
        const h = Math.floor(total / 3600).toString().padStart(2, "0");
        const m = Math.floor((total % 3600) / 60).toString().padStart(2, "0");
        const s = Math.floor(total % 60).toString().padStart(2, "0");
        return `${h}:${m}:${s}`;
    }

    const [glitchStyle, setGlitchStyle] = useState({
        top: "20%",
        animationDuration: "200ms",
    });

    useEffect(() => {
        if (!booted) return;

        setGlitchStyle({
            top: `${17.89 + Math.random() * 60}%`,
            animationDuration: `${180 + Math.random() * 200}ms`,
        });
    }, [booted, glitchKey]);

    return(
        <div className="screen">

            {
                booted && (
                    <div className="status-line">
                        andi.sys — user: guest — uptime {formatUptime(uptimeSeconds)}
                    </div>
                )
            }
            { booted && <div className="interface-switch">
                <Switch.Root
                    id="interface-mode"
                    aria-labelledby="interface-mode-label"
                    className="SwitchRoot"
                    checked={mode === "gui"}
                    onCheckedChange={(checked: boolean) => setMode(checked ? "gui" : "cli")}
                >
                    <Terminal className="switch-icon switch-icon--left" size={16} />
                    <Eye className="switch-icon switch-icon--right" size={16} />
                    <Switch.Thumb className="SwitchThumb" />
                </Switch.Root>
            </div> }

            <div style={{ display: mode === "cli" ? "block" : "none" }}>
                <CliView
                    vfs={vfs}
                    booted={booted}
                    setBooted={setBooted}
                    shuttingDown={shuttingDown}
                    setShuttingDown={setShuttingDown}
                    initialCommand={initial.command}
                />
            </div>
            <div style={{ display: mode === "gui" ? "block" : "none" }}>
                <GuiView
                    vfs={vfs}
                />
            </div>

            { booted && <div key={`glitch-${glitchKey}`}
                             className="glitch"
                             style={glitchStyle}
            /> }

            <div key={`scan-${scanKey}`} className={`scanline ${scanReverse ? "scanline--reverse" : ""}`} />
            <svg className="grain" width="100%" height="100%">
                <filter id="grain">
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"
                                  stitchTiles="stitch"></feTurbulence>
                </filter>
                <rect width="100%" height="100%" filter="url(#grain)"></rect>
            </svg>
            <div className="vignette" />
        </div>
    );
}