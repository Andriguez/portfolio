import * as Switch from "@radix-ui/react-switch";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="switch">
            <Switch.Root 
                className="SwitchRoot" 
                checked={theme === "light"} 
                onCheckedChange={(checked) => setTheme(checked ? "light": "dark")}
            >
                <Moon size={13} className="switch-icon switch-icon--left" />
                <Sun size={13} className="switch-icon switch-icon--right" />
                <Switch.Thumb className="SwitchThumb" />
            </Switch.Root>
        </div>
    );
}