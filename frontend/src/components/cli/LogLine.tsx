import { OutputRenderer } from "./OutputRenderer";
import type { LogEntry } from "../../types/LogEntry"

export function LogLine({ entry, runCommand, skip }: { entry: LogEntry, runCommand: (cmd: string) => void, skip: boolean }) {
    return (
        <div className="log-block">
            <div className="log-prompt-row" style={{ display: "flex", flexWrap: "wrap" }}>
                <span className="log-prompt-chrome">guest@andriguez:~{entry.path}&gt;</span>
                <span className="log-command">{entry.input}</span>
            </div>
            <div className="log-output">
                <OutputRenderer output={entry.output} runCommand={runCommand} skip={skip} />
            </div>
        </div>
    );
}