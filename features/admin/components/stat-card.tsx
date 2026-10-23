// features/admin/components/stat-card.tsx
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: "green" | "red" | "yellow" | "blue";
}

const COLOR = {
  green: "bg-green-500/10 text-green-400 border-green-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  color = "blue",
}: StatCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center border",
          COLOR[color]
        )}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
