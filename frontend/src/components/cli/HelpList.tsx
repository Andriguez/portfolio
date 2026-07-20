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
                        <span className={"cli-dim"} style={{ fontSize: "10px", display: "block"}}>
                            {c.alias ? `(${c.alias})` : ""}
                        </span>
                    </span>
                    <span className="help-desc"> — {c.description}</span>
                </div>
            ))}
        </div>
    );
}