import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import clsx from "clsx";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        "relative rounded-full p-2 hover:bg-secondary transition-colors",
        "text-muted-foreground hover:text-foreground"
      )}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <Sun className={clsx(
        "h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all",
        theme === 'dark' ? "-rotate-90 scale-0 absolute" : ""
      )} />
      <Moon className={clsx(
        "h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all",
        theme === 'dark' ? "rotate-0 scale-100" : "absolute"
      )} />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
