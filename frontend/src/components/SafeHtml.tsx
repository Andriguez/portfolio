import DOMPurify from "dompurify";

export function SafeHtml({ html, className }: { html: string | undefined; className?: string }) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html ?? "") }} />;
}