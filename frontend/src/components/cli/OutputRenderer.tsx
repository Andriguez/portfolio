import type { CommandOutput } from "../../types/CommandOutput"
import { DirectoryList } from "./DirectoryList";
import { TypewriterText } from "./TypeWriterText";
import { HelpList } from "./HelpList";
import { FileContentCard } from "./FileContentCard";
import { CvList } from "./CvList";
import { LinkList } from "./LinkList";
import ReactMarkdown from "react-markdown";

export function OutputRenderer({ output, runCommand }: { output: CommandOutput, runCommand: ((cmd: string) => void) }) {
    if (output.type === "none") return null;

    if (output.type === "text" || output.type == "error") return <TypewriterText text={output.value} color={output.color} />;

    if (output.type === "list") return <DirectoryList items={output.items} onSelect={runCommand} />;

    if (output.type === "help") return <HelpList showExtra={output.extra}/>

    if (output.type === "markdown") return <FileContentCard file={output.file} />

    if (output.type === "changelog") return <div className="content-card"><ReactMarkdown children={output.file} /></div>

    if (output.type === "link") return <a href={output.url} target="_blank" rel="noopener noreferrer">{output.value}</a>

    if (output.type === "cv-list") return <CvList cvs={output.cvs} />

    if (output.type === "link-list") return <LinkList links={output.links} />
    return null;
}