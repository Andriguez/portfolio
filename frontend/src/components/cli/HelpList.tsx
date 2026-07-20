import { commands } from "../../types/commands"

export function HelpList() {
    return (
        <div>
            {commands.map((c, i) => (
                <div
                    key={c.name}
                    className="help-row"
                    style={{ animationDelay: `${i * 100}ms` }}
                >
                    <span className="help-usage">
                        {c.usage}
                        <span className={"help-meta"} style={{ fontSize: "10px", display: "block"}}>
                            {c.alias ? `alias: (${c.alias})` : ""}
                        </span>
                    </span>
                    <span className="help-desc">
                        — {c.description}
                        <span className={"help-meta"}>
                            {c.options ? `<options>: [${c.options.join(", ")}]` : ""}
                        </span>
                    </span>
                </div>
            ))}
        </div>
    );
}