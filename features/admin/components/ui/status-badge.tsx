// components/admin/ui/status-badge.tsx

import {
  statusBadgeCls,
  statusDotCls,
} from "@/features/admin/utils/formatters";

const statusLabel: Record<string, string> = {
  published: "Published",
  queued: "Queued",
  publishing: "Publishing",
  failed: "Failed",
  failed_permanent: "Failed Permanent",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-md border px-2 py-0.5
        text-xs font-medium
        ${statusBadgeCls(status)}
      `}
    >
      <span
        className={`
          h-1.5 w-1.5 rounded-full
          ${statusDotCls(status)}
        `}
      />

      {statusLabel[status] ?? status}
    </span>
  );
}
