"use client";

// features/admin/queue/components/queue-filters-bar.tsx

import { Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  ALL_STATUSES,
  QueueStatus,
  QUEUE_STATUS_LABELS,
} from "../types/queue-types";

const DEBOUNCE_MS = 350;

interface QueueFiltersBarProps {
  activeStatuses: QueueStatus[];
  onStatusToggle: (status: QueueStatus) => void;
}

const STATUS_ACTIVE: Record<QueueStatus, string> = {
  queued:
    "border-sky-300 bg-sky-100 text-sky-700 dark:border-sky-500/40 dark:bg-sky-500/20 dark:text-sky-300",

  publishing:
    "border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/20 dark:text-amber-300",

  published:
    "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-300",

  failed:
    "border-rose-300 bg-rose-100 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/20 dark:text-rose-300",

  failed_permanent:
    "border-red-300 bg-red-100 text-red-700 dark:border-red-700/40 dark:bg-red-900/30 dark:text-red-300",
};

const STATUS_INACTIVE =
  "border-gray-200 bg-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-zinc-700/60 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-300";

export function QueueFiltersBar({
  activeStatuses,
  onStatusToggle,
}: QueueFiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") ?? "";

  const [value, setValue] = useState(initialSearch);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushSearch = useCallback(
    (search: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (search.trim()) {
        params.set("search", search.trim());
      } else {
        params.delete("search");
      }

      params.set("page", "1");

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      pushSearch(value);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <div className="relative w-full sm:max-w-xs">
        <Search
          className="
            pointer-events-none absolute left-2.5 top-1/2
            h-3.5 w-3.5 -translate-y-1/2
            text-gray-400 dark:text-zinc-500
          "
        />

        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search content or account…"
          className="
            h-8 pl-8 pr-8 text-sm
            bg-white border-gray-200 text-gray-800
            placeholder:text-gray-400

            dark:bg-zinc-900
            dark:border-zinc-700/60
            dark:text-zinc-200
            dark:placeholder:text-zinc-600

            focus-visible:ring-1
            focus-visible:ring-blue-400
            focus-visible:border-blue-400

            dark:focus-visible:ring-zinc-500
            dark:focus-visible:border-zinc-500
          "
        />

        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="
              absolute right-1 top-1/2
              h-6 w-6 -translate-y-1/2
              text-gray-400 hover:text-gray-600
              dark:text-zinc-500 dark:hover:text-zinc-300
            "
            onClick={() => setValue("")}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap items-center gap-1.5">
        {activeStatuses.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="
              h-7 px-2 text-xs
              text-gray-400 hover:text-gray-600
              dark:text-zinc-500 dark:hover:text-zinc-300
            "
            onClick={() => activeStatuses.forEach(onStatusToggle)}
          >
            Clear
          </Button>
        )}

        {ALL_STATUSES.map((status) => {
          const isActive = activeStatuses.includes(status);

          return (
            <button
              key={status}
              onClick={() => onStatusToggle(status)}
              className={cn(
                "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-all",
                isActive ? STATUS_ACTIVE[status] : STATUS_INACTIVE
              )}
            >
              {QUEUE_STATUS_LABELS[status]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
