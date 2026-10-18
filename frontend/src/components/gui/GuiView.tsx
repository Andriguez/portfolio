import { useVfs } from "../../hooks/useVfs"
import { FileExplorer } from "./FileExplorer";
import "./gui-view.css"

export function GuiView({ vfs }: { vfs: ReturnType<typeof useVfs> })  {
    return (
        <div className="gui-wrapper" style={{ padding: "4rem 1.6rem" }}>
            <FileExplorer vfs={vfs} />
            <svg className="gui-grain-extra" width="100%" height="100%">
                <filter id="guiGrain">
                    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#guiGrain)" />
            </svg>

        </div>
    );
}