import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItemConfig } from "../types";
import { cn } from "@/lib/utils";

interface NavItemProps extends NavItemConfig {
  isCollapsed: boolean;
}
export function NavItem({
  href,
  icon: Icon,
  label,
  isCollapsed,
  badge,
}: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  const content = (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
        isActive
          ? "bg-[#E6F2ED] text-[#053b2c] font-semibold"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
      )}
    >
      <Icon
        className={cn(
          "w-[18px] h-[18px] shrink-0",
          isActive
            ? "text-[#065f46]"
            : "text-gray-400 group-hover:text-gray-600"
        )}
        strokeWidth={isActive ? 2.2 : 1.8}
      />
      {!isCollapsed && (
        <span className="text-sm tracking-tight flex-1">{label}</span>
      )}
      {!isCollapsed && badge !== undefined && badge > 0 && (
        <span className="text-[10px] font-bold bg-[#065f46] text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
          {badge}
        </span>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs font-medium">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
