import { useState } from "react";
import { useVfs } from "../hooks/useVfs"

type LogEntry = { input: string; output: string };

export function CliShell() {
    const { currentFolder, currentPath, cd, resolveFile } = useVfs();
    const [ input, setInput ] = useState("");
    const [ log, setLog ] = useState<LogEntry[]>([]);

    function runCommand(raw: string) {
        const [cmd, ...args] = raw.trim().split(/\s+/);
        let output = "";

        switch (cmd) {
            case "ls":
                output = currentFolder.children.map((c) => c.name).join("  ");
                break;
            case "cd":
                if (!args[0]) {
                    output = "usage: cd <folder>";
                } else if (!cd(args[0])) {
                    output = `cd: no such folder: ${args[0]}`;
                } else {
                    output = "";
                }
                break;
            case "cat": {
                const file = resolveFile(args[0] ?? "");
                if (file.type !== "folder") {
                    output = file ? file.content.body : `cat: no such file: ${args[0]}`;
                }
                break;
            }
            case "help":
                output = "commands: ls, cd <folder>, cat <file>, help";
                break;
            case "":
                return;
            default:
                output = `command not found: ${cmd}`;
        }

        setLog((prev) => [...prev, {input: raw, output}]);

    }

    return (
        <div style={{ fontFamily: "monospace", padding: "1rem" }}>
            {log.map((entry, i) => (
                <div key={i}>
                    <div>
                        {currentPath}$ {entry.input}
                    </div>
                    {entry.output && <div>{entry.output}</div>}
                </div>
            ))}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    runCommand(input);
                    setInput("");
                }}
            >
                <span>{currentPath}$ </span>
                <input
                    autoFocus
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={{
                        fontFamily: "monospace",
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "inherit",
                        width: "70%",
                    }}
                />
            </form>
        </div>
    );
}