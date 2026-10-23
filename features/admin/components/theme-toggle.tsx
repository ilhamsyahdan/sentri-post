"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useSyncExternalStore } from "react";

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
export function ThemeToggle({ className }: { className?: string }) {
  const mounted = useMounted();

  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
        "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700",
        "dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200",
        className
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
