import { OutputRenderer } from "./OutputRenderer";
import type { LogEntry } from "../../types/LogEntry"

export function LogLine({ entry, runCommand }: { entry: LogEntry, runCommand: (cmd: string) => void }) {
    return (
        <div className="log-block">
            <div className="log-prompt-row">
                <span className="log-prompt-chrome">guest@andriguez:~{entry.path}&gt;</span>
                <span className="log-command">{entry.input}</span>
            </div>
            <div className="log-output">
                <OutputRenderer output={entry.output} runCommand={runCommand} />
            </div>
        </div>
    );
}