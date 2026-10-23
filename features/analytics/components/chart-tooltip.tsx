import { ChartTooltipProps } from "../types/analytics";

interface CustomChartToolTipProps extends ChartTooltipProps {
  metric: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  metric,
}: CustomChartToolTipProps) {
  if (active && payload && payload.length) {
    const item = payload[0];

    return (
      <div className="bg-gray-900 text-white px-3 py-2 rounded-xl text-xs shadow-lg border border-gray-800">
        <p className="font-semibold mb-1 text-gray-300">{label}</p>
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="capitalize text-gray-400">
            {metric === "reach" ? "Reach" : metric}:
          </span>
          <span className="font-bold text-white">{item.value}</span>
        </div>
      </div>
    );
  }

  return null;
}
