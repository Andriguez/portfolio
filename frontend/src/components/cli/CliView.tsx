import { useState } from "react";
import { useVfs } from "../../hooks/useVfs"
import "./cli-view.css"

type LogEntry = { input: string; output: string; path: string };

export function CliView({ vfs }: { vfs: ReturnType<typeof useVfs> }) {
    const { currentFolder, currentPath, cd, resolveFile } = vfs;
    const [ input, setInput ] = useState("");
    const [ log, setLog ] = useState<LogEntry[]>([]);

    function runCommand(raw: string) {
        const promptPath = currentPath;
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

        setLog((prev) => [...prev, {input: raw, output, path: promptPath}]);

    }

    return (
        <div className={"panel cli-dim"} style={{fontFamily: "monospace", padding: "1rem"}}>
            <div className={"cli-boot"}>
                <div>loading andi's portfolio.sys...</div>
                <div>type 'help' for a list of commands</div>
            </div>

            {log.map((entry, i) => (
                <div key={i}>
                    <div>
                        guest@andriguez:{entry.path}{"\>"} {entry.input}
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
                <span className="cli-prompter">guest@andriguez:{currentPath}{"\>"} </span>
                <input
                    className={"cli-green"}
                    id={"input"}
                    autoFocus
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={{ width: `${Math.max(input.length + 0.5)}ch` }}
                />
                <span className="cli-cursor"></span>
            </form>


            <div className="cli-lines"></div>
            <div className="cli-scanline"></div>
            <div className="cli-glitch"></div>
            <svg className="cli-grain" width="100%" height="100%">
                <filter id="grain">
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"
                                  stitchTiles="stitch"></feTurbulence>
                </filter>
                <rect width="100%" height="100%" filter="url(#grain)"></rect>
            </svg>
        </div>
    );
}