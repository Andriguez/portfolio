import {type CommandDefinition, commands} from "../../types/commands"

export function HelpList({ showExtra }: { showExtra: boolean} ) {

    function getCommandsList(): CommandDefinition[] {
        return commands.filter((c) => c.show === !showExtra)
    }

    return (
        <div>
            {
                getCommandsList().map((c, i) => (
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
            { !showExtra && <p className={"help-meta"} style={{ fontSize: "0.85rem", fontWeight: "bold" }}> type 'help --extra' for more commands..</p> }
        </div>
    );
}