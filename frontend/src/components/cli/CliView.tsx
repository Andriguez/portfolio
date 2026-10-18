import { useState, useRef, useEffect, useMemo, useCallback, type Dispatch, type SetStateAction } from "react";
import { useSite } from "../../context/SiteDataContext.ts";
import { CV_PLACE, useVfs } from "../../hooks/useVfs"
import type { LogEntry } from "../../types/LogEntry"
import type { CommandOutput } from "../../types/CommandOutput"
import { LogLine } from "./LogLine"
import { commands, getOptions } from "../../types/commands"
import { tokenize } from "../../helpers/tokenize"
import { BootSequence } from "./BootSequence"
import { isTouchDevice } from "../../helpers/is-touch-device"
import {LoginModal} from "../gui/LoginModal.tsx";
import { cvToNode } from "../../helpers/cvNodes.ts";
import type { VfsFolder, VfsFile } from "../../types/vfs.ts";
import { useTheme } from "../../context/ThemeContext.ts";
import "./cli-view.css"

const EMPTY_FOLDER: VfsFolder = { type: "folder", name: "", slug: "", children: [] };

export type CliViewProps = {
    vfs: ReturnType<typeof useVfs>,
    booted: boolean,
    setBooted: (booted: boolean) => void,
    shuttingDown: boolean,
    setShuttingDown: (shuttingDown: boolean) => void,
    initialCommand: string | null;
    setViewMode: Dispatch<SetStateAction<"cli" | "gui">>;
};

export function CliView({ vfs, booted, setBooted, shuttingDown, setShuttingDown, initialCommand, setViewMode }: CliViewProps ) {
    const { data: site } = useSite();

    const { cd, goToPlace, place, currentFolder, resolveFolder } = vfs;
    
    const currentPath = vfs.displayPath;

    const [ booting, setBooting ] = useState<boolean>(true);

    const [ input, setInput ] = useState("");
    const [ log, setLog ] = useState<LogEntry[]>([]);

    const [ history, setHistory ] = useState<string[]>([]);
    const [ historyIndex, setHistoryIndex ] = useState<number | null>(null);
    const [ draft, setDraft ] = useState("");

    const [ pulseKey, setPulseKey ] = useState(0);
    const { theme, setTheme } = useTheme();

    const cvFolder = useMemo<VfsFolder>(() => ({
        type: "folder", name: "My CV",
        slug: "cv", description: "all my cvs per focus area.",
        children: site.cvs.map(cvToNode),
    }), [site.cvs]);

    const activeFolder = place === CV_PLACE ? cvFolder : (currentFolder ?? EMPTY_FOLDER);

    function getSuggestion(value: string): string | null {
        if (!value) return null;
        const parts = value.split(" ");

        if (parts.length === 1) {
            const names = commands.flatMap((c) => [c.name, c.alias]).filter((n): n is string => !!n);
            return names.find((n) => n.startsWith(parts[0]) && n !== parts[0]) ?? null;
        }

        const lastWord = parts[parts.length - 1];
        if (!lastWord) return null;

        const typed = parts[0];
        const cmd = commands.find((c) => c.name === typed || c.alias === typed);
        const opts = cmd ? getOptions(cmd, site) : [];

        const candidates: string[] = opts.length > 0
            ? opts
            : (Array.isArray(activeFolder?.children) ? activeFolder.children : [])
                .map((c) => c.slug)
                .filter((s): s is string => typeof s === "string");

        const word = lastWord.toLowerCase();
        const match = candidates.find((s) => s.toLowerCase().startsWith(word) && s.toLowerCase() !== word);

        return match ? [...parts.slice(0, -1), match].join(" ") : null;
    };

    const suggestion = getSuggestion(input);
    const suggestionTail = suggestion ? suggestion.slice(input.length) : "";

    const inputRef = useRef<HTMLInputElement>(null);

    function handleContainerClick() {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) return;

        inputRef.current?.focus();
    }

    const [loginOpen, setLoginOpen] = useState(false);

    const runCommand = useCallback((raw: string) => {
        const promptPath = currentPath;
        const [cmdName, ...args] = tokenize(raw.toLowerCase())
        if (!cmdName) return;

        const command = commands.find((c) => c.name === cmdName || c.alias === cmdName);
        let output: CommandOutput;

        if (isTouchDevice()) inputRef.current?.blur();

        if (!command) {
            output = {
                type: "error",
                value: `command not found: ${cmdName} — type 'help' to see what's possible.`,
                color: "cli-info"
            };
        } else {
            const result = command.run(args, { currentFolder: activeFolder, cd: (target) => cd(target)!, resolveFile: (target) => activeFolder.children.find((c): c is VfsFile => c.type === "file" && c.slug === target) ?? null, resolveFolder, site, place, goToPlace, theme, setTheme });
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
            } else if (result === "LOGIN") {
                setLoginOpen(true);
                return;
            } else if (result === "SWITCH_MODE") {
                setViewMode("gui");
                return;
            }

            output = result;
        }

        setLog((prev) => [...prev, {input: raw, output: output, path: promptPath}]);
        setHistory((prev) => [...prev, raw]);
        setHistoryIndex(null);
        setDraft("");
        setPulseKey((k) => k + 1);
    }, [activeFolder, cd, currentPath, goToPlace, place, resolveFolder, setShuttingDown, setTheme, setViewMode, site, theme]);

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

    const scrollToBottom = useCallback(() => {
        const c = containerRef.current;
        if (c) c.scrollTop = c.scrollHeight;
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [log, scrollToBottom]);

    useEffect(() => {
        const vv = window.visualViewport;
        if (!vv) return;
        let raf = 0;
        const onResize = () => {
            if (document.activeElement !== inputRef.current) return;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(scrollToBottom);
        };
        vv.addEventListener("resize", onResize);
        return () => {
            vv.removeEventListener("resize", onResize);
            cancelAnimationFrame(raf);
        };
    }, [scrollToBottom]);

    function handleFocus() {
        scrollToBottom();
        window.setTimeout(scrollToBottom, 350);
    }

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
    }, [setBooted]);

    useEffect(() => {
        const t = setTimeout(() => {
            setBooting(false);
            setPulseKey((k) => k + 1);
        }, 180);
        return () => clearTimeout(t);
    }, []);

    const ranInitial = useRef(false);
    useEffect(() => {
        if (!booted || !initialCommand || ranInitial.current) return;
        ranInitial.current = true;
        runCommand(initialCommand);
    }, [booted, initialCommand, runCommand]);

    return (
        <div
            className={shuttingDown ? "cli-power-off" : booting ? "cli-power-on" : ""}
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
                            onFocus={handleFocus}
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
                <div style={{ height: "1rem" }}/>
            </div>
            <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
        </div>
    );
}