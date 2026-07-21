
export function ExplorerBreadcrumbs( { currentPath, cd }: { currentPath: string, cd: (path: string) => void}) {
    return (
        <div className="gui-path"> <span onClick={() => cd("..")} style={{ cursor: "pointer" }}> ~ { currentPath } </span> </div>
    )
}