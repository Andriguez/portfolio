import { useState } from "react";
import { useVfs } from "../../hooks/useVfs"
import type { VfsFile } from "../../types/vfs"

export function GuiView({ vfs }: { vfs: ReturnType<typeof useVfs> })  {
    const { currentFolder, currentPath, cd } = vfs;
    const [ openFile, setOpenFile ] = useState<VfsFile | null>(null);

    function handleClick(item: (typeof currentFolder.children)[number]) {
        if (item.type === "folder") {
            cd(item.slug);
        } else {
            setOpenFile(item);
        }
    }

    return (
        <div style={{ padding: "3rem 1rem" }}>
            <div style={{ marginBottom: "1rem", fontFamily: "monospace" }}>
                {currentPath || "/"}
                {currentPath !== "" && (
                    <button onClick={() => cd("..")} style={{ marginLeft: "1rem" }}>
                        ↑ up
                    </button>
                )}
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                    gap: "1rem",
                }}
            >
                {currentFolder.children.map((item) => (
                    <button
                        key={item.slug}
                        onClick={() => handleClick(item)}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.5rem",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
            <span style={{ fontSize: "2rem" }}>
              {item.type === "folder" ? "📁" : "📄"}
            </span>
                        <span style={{ fontSize: "0.8rem", textAlign: "center" }}>
              {item.name}
            </span>
                    </button>
                ))}
            </div>

            {openFile && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onClick={() => setOpenFile(null)}
                >
                    <div
                        style={{
                            background: "white",
                            color: "black",
                            padding: "2rem",
                            borderRadius: "8px",
                            maxWidth: "500px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>{openFile.content.title}</h2>
                        <img src={openFile.content.image} alt={openFile.content.title} style={{ width: "50%", height: "50%" }} />
                        <p>{openFile.content.body}</p>
                        <button onClick={() => setOpenFile(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}