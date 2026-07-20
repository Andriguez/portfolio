import { ExplorerButtons } from './ExplorerButtons';
import { ExplorerBreadcrumbs } from './ExplorerBreadcrumbs';

export function FileExplorer() {
    return (
        <div>
            <div className="panel gui">
                <div className="gui-titlebar">
                    <span>portfolio</span>
                    <ExplorerButtons />
                </div>
                <div className="gui-body">
                    <ExplorerBreadcrumbs />
                    <div className="gui-grid">
                        <div className="gui-item">
                            <div className="gui-icon"></div>
                            <span className="gui-item-label">about.md</span></div>
                        <div className="gui-item">
                            <div className="gui-icon"></div>
                            <span className="gui-item-label">contact.md</span></div>
                        <div className="gui-item">
                            <div className="gui-icon"></div>
                            <span className="gui-item-label">ecommerce-app</span></div>
                        <div className="gui-item">
                            <div className="gui-icon"></div>
                            <span className="gui-item-label">cli-portfolio</span></div>
                    </div>
                    <div className="gui-dialog">
                        <div className="gui-dialog-title">ecommerce-app</div>
                        <div className="gui-dialog-body">
                            Overview dialog — this is where the file's content renders when clicked, styled as a card
                            rather than a raw text dump.
                        </div>
                    </div>
                </div>
                <svg className="gui-grain" width="100%" height="100%">
                    <filter id="grain2">
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"
                                      stitchTiles="stitch"></feTurbulence>
                    </filter>
                    <rect width="100%" height="100%" filter="url(#grain2)"></rect>
                </svg>
            </div>
        </div>
    )
}