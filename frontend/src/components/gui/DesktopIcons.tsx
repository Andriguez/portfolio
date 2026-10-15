import { useState } from "react";
import { ComputerIcon, Trash2, KeyRound, Sparkles, FileUser } from "lucide-react";

export function DesktopIcons({
                                 onRestore, onLoginClick, onCvClick
                             }: { onRestore: () => void; onLoginClick: () => void; onCvClick: () => void | undefined; }) {
    const [trashOpen, setTrashOpen] = useState(false);

    return (
        <div className="desktop-icons">
              {/* <div className="desktop-icon">
                <Camera size={30} />
                <span>Smile :{`)`}</span>
            </div> */}
            <div className="desktop-icon" onClick={onRestore}>
                <ComputerIcon size={30} />
                <span>ANDRIGUEZ</span>
            </div>
            { onCvClick !== undefined && 
                (<div className="desktop-icon" onClick={onCvClick}>
                    <FileUser size={30} />
                    <span>My CV</span>
                </div>)
            }
            <div className="desktop-icon" onClick={onLoginClick}>
                <KeyRound size={30} />
                <span>Login</span>
            </div>
            <div className="desktop-icon">
                <Sparkles size={30} />
                <span>8ball</span>
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
    
        </div>
    );
}