import { useState, useRef, useEffect } from "react";
import { useVfs } from "../../hooks/useVfs"
import type { LogEntry } from "../../types/LogEntry"
import type { CommandOutput } from "../../types/CommandOutput"
import { LogLine } from "./LogLine"
import { commands } from "../../types/commands"
import { tokenize } from "../../helpers/tokenize"
import { BootSequence } from "./BootSequence"
import { isTouchDevice } from "../../helpers/is-touch-device"
import "./cli-view.css"

export type CliViewProps = {
    vfs: ReturnType<typeof useVfs>,
    booted: boolean,
    setBooted: (booted: boolean) => void,
    shuttingDown: boolean,
    setShuttingDown: (shuttingDown: boolean) => void
}

export function CliView({ vfs, booted, setBooted, shuttingDown, setShuttingDown }: CliViewProps ) {

    const { currentFolder, currentPath, cd, resolveFile } = vfs;

    const [ booting, setBooting ] = useState<boolean>(true);

    const [ input, setInput ] = useState("");
    const [ log, setLog ] = useState<LogEntry[]>([]);

    const [ history, setHistory ] = useState<string[]>([]);
    const [ historyIndex, setHistoryIndex ] = useState<number | null>(null);
    const [ draft, setDraft ] = useState("");

    const [ pulseKey, setPulseKey ] = useState(0);
    const [ glitchKey, setGlitchKey ] = useState(0);
    const [ scanKey, setScanKey ] = useState(0);
    const [scanReverse, setScanReverse] = useState(false);

    function getSuggestion(value: string): string | null {
        if (!value) return null;
        const parts = value.split(" ");
        if (parts.length === 1) {
            const match = commands.find((c) => c.name.startsWith(parts[0]) && c.name !== parts[0]);
            return match ? match.name : null;
        }
        const lastWord = parts[parts.length - 1];
        if (!lastWord) return null;
        const match = currentFolder.children.find(
            (c) => c.slug.startsWith(lastWord) && c.slug !== lastWord
        );
        return match ? [...parts.slice(0, -1), match.slug].join(" ") : null;
    }

    const suggestion = getSuggestion(input);
    const suggestionTail = suggestion ? suggestion.slice(input.length) : "";

    const inputRef = useRef<HTMLInputElement>(null);

    function handleContainerClick() {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) return;

        inputRef.current?.focus();
    }

    function runCommand(raw: string) {
        const promptPath = currentPath;
        const [cmdName, ...args] = tokenize(raw)
        if (!cmdName) return;

        const command = commands.find((c) => c.name === cmdName || c.alias === cmdName);
        let output: CommandOutput;

        if (isTouchDevice()) inputRef.current?.blur();

        if (!command) {
            output = {
                type: "error",
                value: `command not found: ${cmdName} — type 'help' to see what's available`,
                color: "cli-info"
            };
        } else {
            const result = command.run(args, { currentFolder, cd, resolveFile });
            if (result === "CLEAR") {
                setLog([]);
                setHistory((prev) => [...prev, raw]);
                setHistoryIndex(null);
                setDraft("");
                return;
            } else if (result === "EXIT") {
                setShuttingDown(true);
                setTimeout(() => {
                    window.close();
                }, 500);
                return;
            }
            output = result;
        }

        setLog((prev) => [...prev, {input: raw, output: output, path: promptPath}]);
        setHistory((prev) => [...prev, raw]);
        setHistoryIndex(null);
        setDraft("");
        setPulseKey((k) => k + 1);
    }

        function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
            if (e.key === "ArrowUp") {
                e.preventDefault();
                if (history.length === 0) return;
                if (historyIndex === null) {
                    setDraft(input);
                    setHistoryIndex(history.length - 1);
                    setInput(history[history.length - 1]);
                } else if (historyIndex > 0) {
                    setHistoryIndex(historyIndex - 1);
                    setInput(history[historyIndex - 1]);
                }
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                if (historyIndex === null) return;
                if (historyIndex < history.length - 1) {
                    setHistoryIndex(historyIndex + 1);
                    setInput(history[historyIndex + 1]);
                } else {
                    setHistoryIndex(null);
                    setInput(draft);
                }
            } else if (e.key === "Tab") {
                e.preventDefault();
                if (suggestion) setInput(suggestion);
            }
        }

    const containerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const isOverflowing = container.scrollHeight > container.clientHeight;
        if (isOverflowing) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [log]);

    useEffect(() => {
        function scheduleGlitch() {
            const delay = 15000 + Math.random() * 30000; // 15–45s, never the same twice
            return setTimeout(() => {
                setGlitchKey((k) => k + 1);
                scheduleGlitch();
            }, delay);
        }
        const timeout = scheduleGlitch();
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        function skipBoot() {
            setBooting(false);
            setBooted(true);
        }
        window.addEventListener("keydown", skipBoot, { once: true });
        window.addEventListener("pointerdown", skipBoot, { once: true });
        return () => {
            window.removeEventListener("keydown", skipBoot);
            window.removeEventListener("pointerdown", skipBoot);
        };
    }, []);

    useEffect(() => {
        function scheduleScan() {
            const delay = 2000 + Math.random() * 6000;
            return setTimeout(() => {
                setScanReverse(Math.random() > 0.4);
                setScanKey((k) => k + 1);
                scheduleScan();
            }, delay);
        }
        const timeout = scheduleScan();
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            setBooting(false);
            setPulseKey((k) => k + 1);
        }, 180);
        return () => clearTimeout(t);
    }, []);

    return (
        <div
            className={shuttingDown ? "cli-screen cli-power-off" : booting ? "cli-screen cli-power-on" : "cli-screen"}
            onClick={handleContainerClick}
        >
            <div
                ref={containerRef}
                className={"panel invisible-scrollbar"}
            >
                { !booting && <BootSequence onComplete={() => setBooted(true)} /> }
            {log.map((entry, i) => (
                <LogLine key={i} entry={entry} runCommand={runCommand} />
            ))}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    runCommand(input);
                    setInput("");
                }}
            >
                <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    width: "100%",
                }}
                >
                    {!booted && <div className="cli-star" />}
                    {booted && <span className="cli-prompter" style={{ flexShrink: 0 }}>guest@andriguez:~{currentPath}&gt; </span>}
                    <span style={{ display: "inline-flex", alignItems: "center", minWidth: "3ch", flex: 1}}>
                        <input
                            ref={inputRef}
                            className={"cli-green"}
                            id={"input"}
                            autoFocus
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{ width: `min(${input.length + 0.75}ch, 90%)` }}
                        />
                        <span className="cli-cursor" />
                        {suggestionTail && (
                            <span
                                onClick={() => suggestion && setInput(suggestion)}
                                style={{ opacity: 0.35, cursor: "pointer" }}
                            >
                                {suggestionTail}
                            </span>
                        )}
                        <span className={"prompt-pulse-wrap"}>
                            <span key={pulseKey} className="prompt-pulse" />
                        </span>
                    </span>
                </div>
            </form>
                <div ref={bottomRef} />
            </div>

                <div key={scanKey} className={`cli-scanline ${scanReverse ? "cli-scanline--reverse" : ""}`} />
                { booted && <div key={glitchKey}
                 className="cli-glitch"
                 style={{
                     top: `${ 17.89 + Math.random() * 60}%`,
                     animationDuration: `${180 + Math.random() * 200}ms` }}
            /> }
            <svg className="cli-grain" width="100%" height="100%">
                <filter id="grain">
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"
                                  stitchTiles="stitch"></feTurbulence>
                </filter>
                <rect width="100%" height="100%" filter="url(#grain)"></rect>
            </svg>
                <div className="cli-vignette" />
            </div>
    );
}