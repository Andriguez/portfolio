import * as Switch from "@radix-ui/react-switch";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) {
    return (
        <div className="switch">
            <Switch.Root className="SwitchRoot" checked={theme === "light"} onCheckedChange={toggleTheme}>
                <Moon size={13} className="switch-icon switch-icon--left" />
                <Sun size={13} className="switch-icon switch-icon--right" />
                <Switch.Thumb className="SwitchThumb" />
            </Switch.Root>
        </div>
    );
}