import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export function Trend({
  value,
  inverted = false,
}: {
  value: number;
  inverted?: boolean;
}) {
  if (value > 0)
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
          inverted ? "text-emerald-200" : "text-emerald-600"
        }`}
      >
        <ArrowUpRight size={12} /> {value.toFixed(1)}%
      </span>
    );
  if (value < 0)
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
          inverted ? "text-rose-200" : "text-rose-500"
        }`}
      >
        <ArrowDownRight size={12} /> {Math.abs(value).toFixed(1)}%
      </span>
    );
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
        inverted ? "text-emerald-300/70" : "text-gray-400"
      }`}
    >
      <Minus size={12} /> 0%
    </span>
  );
}
