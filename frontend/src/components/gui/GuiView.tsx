import { useVfs } from "../../hooks/useVfs"
import { FileExplorer } from "./FileExplorer";
import "./gui-view.css"

export function GuiView({ vfs }: { vfs: ReturnType<typeof useVfs> })  {
    return (
        <div style={{ padding: "4rem 2rem" }}>
            <FileExplorer vfs={vfs} />
        </div>
    );
}