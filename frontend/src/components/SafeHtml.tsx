import DOMPurify from "dompurify";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";

export function SafeHtml({ html, className }: { html: string | undefined; className?: string }) {
    const navigate = useNavigate();

    function handleClick(e: MouseEvent<HTMLDivElement>) {
        if (e.defaultPrevented || e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        const anchor = (e.target as HTMLElement).closest("a");
        if (!anchor || !e.currentTarget.contains(anchor)) return;

        if (anchor.target && anchor.target !== "_self") return;
        if (anchor.hasAttribute("download")) return;

        const href = anchor.getAttribute("href");
        if (!href || href.startsWith("//")) return;
        if (!href.startsWith("/") && !href.startsWith("#") && !href.startsWith("?")) return;

        if (href.startsWith("/api/") || href.startsWith("/uploads/")) return;

        e.preventDefault();
        navigate(href);
    }


    return (
        <div 
            className={className} 
            onClick={handleClick}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html ?? "") }}
        />
    );
}