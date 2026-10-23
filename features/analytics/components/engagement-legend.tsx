export function EngagementLegend() {
  const items = [
    { color: "#10B981", label: "≥3% Baik" },
    { color: "#F59E0B", label: "≥1% Cukup" },
    { color: "#D1D5DB", label: "<1% Rendah" },
  ];
  return (
    <div className="flex items-center gap-3">
      {items.map((it) => (
        <span
          key={it.label}
          className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400"
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: it.color }}
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}
