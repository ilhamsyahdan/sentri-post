// components/admin/ui/empty-state.tsx

export function EmptyState({
  icon = "□",
  title,
  description,
}: {
  icon?: string;
  title: string;
  description?: string;
}) {
  return (
    <div
      className="
        flex flex-col items-center justify-center
        px-4 py-14 text-center
      "
    >
      <span className="mb-3 text-2xl opacity-20">{icon}</span>

      <p className="text-sm font-medium text-zinc-500">{title}</p>

      {description && (
        <p className="mt-1 max-w-xs text-xs text-zinc-700">{description}</p>
      )}
    </div>
  );
}
