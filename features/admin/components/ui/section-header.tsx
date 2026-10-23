import { ReactNode } from "react";

export function SectionHeader({
  title,
  description,
  badge,
  action,
}: {
  title: string;
  description?: string;
  badge?: string | number;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-2.5">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {title}
        </h2>
        {badge !== undefined && (
          <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-xs font-mono">
            {badge}
          </span>
        )}
        {description && (
          <span className="text-xs text-gray-400 hidden sm:inline">
            — {description}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}
