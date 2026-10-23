"use client";

import { cn } from "@/lib/utils";
import { RightPanel } from "../../types";

interface PanelTabProps {
  panel: RightPanel;
  activePanel: RightPanel;
  icon: React.ReactNode;
  label: string;
  activeClassName: string;
  onClick: (panel: RightPanel) => void;
}

export function PanelTab({
  panel,
  activePanel,
  icon,
  label,
  activeClassName,
  onClick,
}: PanelTabProps) {
  const isActive = panel === activePanel;

  return (
    <button
      onClick={() => onClick(panel)}
      aria-pressed={isActive}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex-1 justify-center",
        isActive ? activeClassName : "text-gray-400 hover:text-gray-600"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
