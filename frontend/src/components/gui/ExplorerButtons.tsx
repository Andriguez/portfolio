export function ExplorerButtons({onMinimize, onClose}: { onMinimize: () => void, onClose: () => void })  {
    return (
        <div className="gui-titlebar-controls">
            <span className="win-btn win-btn--min" onClick={onMinimize} >
                <span className="win-btn-icon">–</span>
            </span>
            <span className="win-btn win-btn--max"/>
            <span className="win-btn win-btn--close" onClick={onClose}>
                <span className="win-btn-icon">x</span>
            </span>
        </div>
    )
}