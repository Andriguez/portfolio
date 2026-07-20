import { useState, useEffect } from "react";

export function TypewriterText({
                                   text,
                                   color,
                                   speed = 20
                               }: {
    text: string;
    color: string
    speed?: number;
}) {
    const [revealed, setRevealed] = useState("");

    useEffect(() => {
        setRevealed("");
        let i = 0;
        const interval = setInterval(() => {
            i++;
            setRevealed(text.slice(0, i));
            if (i >= text.length) clearInterval(interval);
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);

    return <div className={`log-line ${color}`}>{revealed}</div>;
}