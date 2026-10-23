import { cn } from "@/lib/utils";

interface SidebarBrandingProps {
  isCollapsed: boolean;
}

export const SidebarBranding = ({ isCollapsed }: SidebarBrandingProps) => (
  <div
    className={cn(
      "h-16 flex items-center shrink-0",
      isCollapsed ? "px-2 justify-center" : "px-3 gap-3"
    )}
  >
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#065f46] text-xl font-black text-white select-none">
      S
    </div>
    {!isCollapsed && (
      <span className="font-black text-[17px] tracking-tighter text-gray-900 truncate italic">
        SENTRIPOSTS
      </span>
    )}
  </div>
);
