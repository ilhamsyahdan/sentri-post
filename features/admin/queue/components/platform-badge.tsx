import { cn } from "@/lib/utils";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  tiktok: "bg-zinc-400/10 text-zinc-300 border-zinc-500/20",
  linkedin: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  twitter: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  x: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  facebook: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  youtube: "bg-red-500/10 text-red-400 border-red-500/20",
};

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "IG",
  tiktok: "TK",
  linkedin: "LI",
  twitter: "TW",
  x: "X",
  facebook: "FB",
  youtube: "YT",
};

interface PlatformBadgeProps {
  platform: string;
  username?: string | null;
  className?: string;
}

export function PlatformBadge({
  platform,
  username,
  className,
}: PlatformBadgeProps) {
  const key = platform.toLowerCase();
  const colorClass =
    PLATFORM_COLORS[key] ?? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  const icon = PLATFORM_ICONS[key] ?? platform.slice(0, 2).toUpperCase();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold border",
          colorClass
        )}
      >
        {icon}
      </span>
      {username && (
        <span className="text-xs text-zinc-400 truncate max-w-[120px]">
          @{username}
        </span>
      )}
    </div>
  );
}
