import { useState, type CSSProperties } from "react";

type LinkItem = { id: number; name: string; url: string };

const DEFAULT_HINT = "press a button to open in a new tab";

function displayUrl(url: string) {
    try {
        const u = new URL(url);
        return (u.host.replace(/^www\./, "") + u.pathname).replace(/\/$/, "");
    } catch {
        return url;
    }
}

function isWebUrl(url: string) {
    try {
        return ["http:", "https:"].includes(new URL(url).protocol);
    } catch {
        return false;
    }
}

export function LinkList({ links }: { links: LinkItem[] }) {
    const [active, setActive] = useState<string | null>(null);
    const safeLinks = links.filter((l) => isWebUrl(l.url));

    return (
        <div className="link-keys">
            <div className="link-keys-row">
                {safeLinks.map((l, i) => (
                    <a
                        key={l.id}
                        className="link-key"
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={l.url}
                        style={{ "--i": i } as CSSProperties}
                        onMouseEnter={() => setActive(l.url)}
                        onMouseLeave={() => setActive(null)}
                        onFocus={() => setActive(l.url)}
                        onBlur={() => setActive(null)}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {l.name.toLowerCase()} <span className="link-key-arrow">↗</span>
                    </a>
                ))}
            </div>
            <div className="link-keys-hint">
                {active ? `↳ ${displayUrl(active)}` : DEFAULT_HINT}
            </div>
        </div>
    );
}