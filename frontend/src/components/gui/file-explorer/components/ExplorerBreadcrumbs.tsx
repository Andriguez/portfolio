import { useVfs } from "../../../../hooks/useVfs";

export function ExplorerBreadcrumbs() {

    const vfs = useVfs();

    return (
        <div className="grid-breadcrumb">
            <span onClick={() => vfs.goToPath([])} className="crumb">home</span>
            {vfs.pathParts.map((part, i) => (
                <span key={i}>
                        <span className="crumb-sep">/</span>
                        <span className="crumb" onClick={() => vfs.goToPath(vfs.pathParts.slice(0, i + 1))}>
                            {part}
                        </span>
                    </span>
            ))}
        </div>    )
}