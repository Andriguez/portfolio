import { useState, useEffect, useRef, type CSSProperties } from "react";
import { ComputerIcon, Trash2, KeyRound, Sparkles, FileUser } from "lucide-react";
import { EIGHT_BALL_ANSWERS } from "../../data/eightBall";

export function DesktopIcons({
                                 onRestore, onLoginClick, onCvClick, onTrashClick
                             }: { onRestore: () => void; onLoginClick: () => void; onCvClick: () => void | undefined; onTrashClick: () => void}) {
                                
    const [answer, setAnswer] = useState<string | null>(null);
    const [shaking, setShaking] = useState(false);
    const timers = useRef<number[]>([]);

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

    const PLACEMENT = {
        pc:     { x: "5%",  y: "12%" },
        trash:  { x: "86%", y: "82%" },
        login:  { x: "72%", y: "82%" },
        cv:     { x: "5%", y: "24%" },
        ball:   { x: "50%", y: "45%" },
    };

    const at = (key: keyof typeof PLACEMENT, i: number) => ({
        "--x": PLACEMENT[key].x, "--y": PLACEMENT[key].y, "--i": i
    }) as CSSProperties;

    return (
        <div className="desktop-icons">
              {/* <div className="desktop-icon">
                <Camera size={30} />
                <span>Smile :{`)`}</span>
            </div> */}
            <div className="desktop-icon" style={at("pc", 0)} data-corner="tl" onClick={onRestore}>
                <ComputerIcon size={30} />
                <span>ANDRIGUEZ</span>
            </div>
            { onCvClick && 
                (<div className="desktop-icon" style={at("cv", 1)} data-corner="tl" onClick={onCvClick}>
                    <FileUser size={30} />
                    <span>My CV</span>
                </div>)
            }
            <div className="desktop-icon" style={at("login", 1)} data-corner="br" onClick={onLoginClick}>
                <KeyRound size={30} />
                <span>Login</span>
            </div>
            <div className={`desktop-icon ${shaking ? "desktop-icon--shaking" : ""}`} style={at("ball",2)} data-corner="center" onClick={ask8Ball}>
                <Sparkles size={30} />
                <span>8ball</span>
                {answer && (
                    <div className="desktop-icon-tooltip eightball-bubble" onClick={(e) => e.stopPropagation()}>
                        {answer}
                    </div>
                )}
            </div>
            <div className="desktop-icon" style={at("trash", 0)} data-corner="br" onClick={onTrashClick}>
                <Trash2 size={30} />
                <span>Trash</span>
            </div>
    
        </div>
    );
}