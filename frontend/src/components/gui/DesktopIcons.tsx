import { useState } from "react";
import { ComputerIcon, Trash2, KeyRound } from "lucide-react";

export function DesktopIcons({
                                 onRestore, onLoginClick,
                             }: { onRestore: () => void; onLoginClick: () => void }) {
    const [trashOpen, setTrashOpen] = useState(false);

    return (
        <div className="desktop-icons">
            <div className="desktop-icon" onClick={onRestore}>
                <ComputerIcon size={30} />
                <span>ANDRIGUEZ</span>
            </div>
            <div className="desktop-icon" onClick={() => setTrashOpen((v) => !v)}>
                <Trash2 size={30} />
                <span>Trash</span>
                {trashOpen && (
                    <div className="desktop-icon-tooltip" onClick={(e) => e.stopPropagation()}>
                        nothing to see here actually.
                    </div>
                )}
            </div>
            <div className="desktop-icon" onClick={onLoginClick}>
                <KeyRound size={30} />
                <span>Login</span>
            </div>
        </div>
    );
}