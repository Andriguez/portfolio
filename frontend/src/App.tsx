import './App.css'
import { useState } from 'react'
import { useVfs } from "./hooks/useVfs"
import { CliView } from "./components/cli/CliView"
import { GuiView } from "./components/gui/GuiView"

function App() {
    const vfs = useVfs();
    const [mode, setMode] = useState<"cli" | "gui">("cli");

  return(
      <div>
          <button onClick={() => setMode(mode === "cli" ? "gui" : "cli")}>
              Switch to {mode === "gui" ? "CLI" : "GUI"} mode
          </button>
          {mode === "cli" ? <CliView vfs={vfs} /> : <GuiView vfs={vfs} />}
      </div>
  );
}

export default App
