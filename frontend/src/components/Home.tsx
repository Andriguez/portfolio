import { useState, useEffect } from 'react'
import { Switch } from "radix-ui"
import { Terminal, Eye } from "lucide-react"
import { useVfs } from "../hooks/useVfs"
import { CliView } from "./cli/CliView"
import { GuiView } from "./gui/GuiView"

export function Home() {
    const vfs = useVfs();
    const [mode, setMode] = useState<"cli" | "gui">("cli");

    const [ booted, setBooted ] = useState<boolean>(false);
    const [ shuttingDown, setShuttingDown ] = useState<boolean>(false);


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

    return(
        <div>

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
                />
            </div>
            <div style={{ display: mode === "gui" ? "block" : "none" }}>
                <GuiView
                    vfs={vfs}
                />
            </div>
        </div>
    );
}