import type { CommandOutput } from "../../types/CommandOutput"
import { DirectoryList } from "./lists/DirectoryList";
import { TypewriterText } from "./effects/TypeWriterText";
import { HelpList } from "./lists/HelpList";
import { FileContentCard } from "./FileContentCard";
import { CvList } from "./lists/CvList";
import { LinkList } from "./lists/LinkList";
import { CvViewer } from "../gui/file-explorer/content-panels/CvViewer";

export function OutputRenderer({ output, runCommand, skip }: { output: CommandOutput, runCommand: ((cmd: string) => void), skip: boolean }) {
    if (output.type === "none") return null;

    if (output.type === "text" || output.type == "error") return <TypewriterText text={output.value} color={output.color} skip={skip} />;

    if (output.type === "list") return <DirectoryList items={output.items} onSelect={runCommand} />;

    if (output.type === "help") return <HelpList showExtra={output.extra}/>

    if (output.type === "markdown") return <FileContentCard file={output.file} />

    if (output.type === "link") return <a href={output.url} target="_blank" rel="noopener noreferrer">{output.value}</a>

    if (output.type === "cv-list") return <CvList cvs={output.cvs} runCommand={runCommand} />

    if (output.type === "cv-view") return <div className="content-card"><p>{output.cv.filename}</p><CvViewer cv={output.cv} onClose={() => {runCommand("clear")}} /></div>

    if (output.type === "link-list") return <LinkList links={output.links} />
    return null;
}