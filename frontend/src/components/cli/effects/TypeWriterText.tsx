import { useState, useEffect } from "react";

export function TypewriterText({
                                   text,
                                   speed = 15,
                                   color,
                                   skip
                               }: {
    text: string;
    speed?: number;
    color?: string;
    skip?: boolean;
}) {
    const [progress, setProgress] = useState({ text, count: 0});

    const count = progress.text === text ? progress.count : 0;
    const shown = skip ? text.length : count;

    const revealed = text.slice(0, shown);

    useEffect(() => {
        if (text.length === 0 || skip) return;

        let i = 0;
        const interval = setInterval(() => {
            i++;
            setProgress({ text, count: i });
            if (i >= text.length) clearInterval(interval);
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);

    return <div className={`log-line`} style={{ color: `var(--${color})` }}>{revealed}</div>;
}