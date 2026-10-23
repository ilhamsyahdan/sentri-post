import { fmt } from "../utils/formatters";

export function Metric({
  icon: Icon,
  value,
  color,
}: {
  icon: React.ElementType;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <Icon size={12} style={{ color }} strokeWidth={2} />
      <span className="text-xs font-bold text-gray-700 tabular-nums">
        {fmt(value)}
      </span>
    </div>
  );
}
