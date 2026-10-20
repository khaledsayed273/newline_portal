import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

// Theme switch button (light/dark). Renders only when ThemeProvider is switchable.
export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme, switchable } = useTheme();
  if (!switchable || !toggleTheme) return null;
  const dark = theme === "dark";
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-pressed={dark}
      aria-label={
        dark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"
      }
      title={dark ? "الوضع الفاتح" : "الوضع الداكن"}
      className={cn(
        "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full p-0 transition-all hover:bg-muted",
        className
      )}
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </Button>
  );
}
