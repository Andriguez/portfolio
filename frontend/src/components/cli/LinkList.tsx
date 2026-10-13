// src/components/cli/LinkList.tsx
type LinkItem = { id: number; name: string; url: string };

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
    return (
        <div className="link-list">
            {links.filter((l) => isWebUrl(l.url)).map((l, i) => (
                <a
                    key={l.id}
                    className="link-row"
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ animationDelay: `${i * 80}ms` }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <span className="link-row-name">{l.name.toLowerCase()}</span>
                    <span className="link-row-url">{displayUrl(l.url)}</span>
                    <span className="link-row-arrow">↗</span>
                </a>
            ))}
            <div className="link-list-hint">tap a row to open it in a new tab</div>
        </div>
    );
}