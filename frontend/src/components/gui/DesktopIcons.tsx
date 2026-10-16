import { useState, useEffect, useRef } from "react";
import { ComputerIcon, Trash2, KeyRound, Sparkles, FileUser } from "lucide-react";
import { EIGHT_BALL_ANSWERS } from "../../data/eightBall";

export function DesktopIcons({
                                 onRestore, onLoginClick, onCvClick
                             }: { onRestore: () => void; onLoginClick: () => void; onCvClick: () => void | undefined; }) {
    const [trashOpen, setTrashOpen] = useState(false);
    const [answer, setAnswer] = useState<string | null>(null);
    const [shaking, setShaking] = useState(false);
    const timers = useRef<number[]>([]);

    useEffect(() => {
    if (!trashOpen) return;
    const t = window.setTimeout(() => setTrashOpen(false), 3000);
    return () => window.clearTimeout(t);
    }, [trashOpen]);

    useEffect(() => {
        const pending = timers.current;
        return () => pending.forEach((t) => window.clearTimeout(t));
    }, []);

    function ask8Ball() {
        timers.current.forEach((t) => window.clearTimeout(t));
        timers.current = []
        setAnswer(null);
        setShaking(true);

        timers.current.push(
            window.setTimeout(() => {
                setShaking(false);
                setAnswer(EIGHT_BALL_ANSWERS[Math.floor(Math.random() * EIGHT_BALL_ANSWERS.length)]);
            }, 650),
        window.setTimeout(() => setAnswer(null), 4000),
        );
    }

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
            { onCvClick && 
                (<div className="desktop-icon" onClick={onCvClick}>
                    <FileUser size={30} />
                    <span>My CV</span>
                </div>)
            }
            <div className="desktop-icon" onClick={onLoginClick}>
                <KeyRound size={30} />
                <span>Login</span>
            </div>
            <div className={`desktop-icon ${shaking ? "desktop-icon--shaking" : ""}`} onClick={ask8Ball}>
                <Sparkles size={30} />
                <span>8ball</span>
                {answer && (
                    <div className="desktop-icon-tooltip eightball-bubble" onClick={(e) => e.stopPropagation()}>
                        {answer}
                    </div>
                )}
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