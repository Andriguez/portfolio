import { useState, useEffect } from "react";
import { TypewriterText } from "./TypeWriterText"

export function BootSequence({ onComplete }: { onComplete: () => void }) {
    const lines = ["starting andi.sys...", " loading portfolio..", "type 'help' for a list of commands :)"];
    const [visibleCount, setVisibleCount] = useState(0);

    useEffect(() => {
        if (visibleCount >= lines.length) {
            const t = setTimeout(onComplete, 800);
            return () => clearTimeout(t);
        }
        const t = setTimeout(() => setVisibleCount((c) => c + 1), 1000);
        return () => clearTimeout(t);
    });

    return (
        <div className="cli-boot">
            {lines.slice(0, visibleCount).map((line, i) => (

                <div key={i} className={"log-line-shadow"}>
                    <TypewriterText text={line} speed={20} />
                </div>
            ))}
        </div>
    );
}