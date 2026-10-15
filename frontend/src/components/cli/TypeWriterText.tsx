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
    const [progress, setProgress] = useState({ text, count: 0});

    const count = progress.text === text ? progress.count : 0;
    const revealed = text.slice(0, count);

    useEffect(() => {
        if (text.length === 0) return;

        let i = 0;
        const interval = setInterval(() => {
            i++;
            setProgress({ text, count: i });
            if (i >= text.length) clearInterval(interval);
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);

    return <div className={`log-line ${color}`}>{revealed}</div>;
}