import { isTouchDevice } from "../../../helpers/is-touch-device"

export function DirectoryList({ items, onSelect }: {
    items: {
        name: string;
        slug: string;
        isFolder: boolean;
        description? : string
        itemCount?: number;
        updatedAt?: string;
        dir?: string;
    }[];
        onSelect: (cmd: string) => void;
}) {
    return (
        <div>
            <div className="ls-total">total {items?.length} items</div>
            {items?.map((item, i) => (
                <div
                    key={item.slug}
                    className="ls-row"
                    style={{ animationDelay: `${i * 120}ms` }}
                    onClick={(e) => {
                        if (isTouchDevice()) e.stopPropagation();
                        onSelect(item.isFolder ? `cd ${item.slug}` : `cat ${item.slug}`);    
                    }
                    }
                >
                    <span className="ls-type-badge">
                        <span className="ls-type-glyph">{item.isFolder ? "d" : "-"}</span>
                        <span className="ls-type-label">{item.isFolder ? "PAGE" : "ENTRY"}</span>
                    </span>
                    <span className="ls-name">{item.isFolder ? `${item.name}/` : item.name}</span>
                    <span className="ls-hint">
                        {item.isFolder ? ` dir ${item.slug}` : ` view ${item.slug}`}
                    </span>
                    <div className="ls-meta">
                        {item.isFolder ? `${item.itemCount ?? 0} items` : item.description ?? ""}
                        {" · andi · "}
                        { item.updatedAt ? String(new Date(item.updatedAt).toLocaleDateString()) : "—"}
                    </div>
                </div>
            ))}
        </div>
    );
}