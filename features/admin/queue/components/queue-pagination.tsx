"use client";

// features/admin/queue/components/queue-pagination.tsx

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QueuePaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export function QueuePagination({
  currentPage,
  totalPages,
  total,
  pageSize = 20,
  onPageChange,
}: QueuePaginationProps) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  const pages: (number | "…")[] = [];
  const WINDOW = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - WINDOW && i <= currentPage + WINDOW)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex items-center justify-between px-1">
      {/* Count label */}
      <p
        className="text-xs tabular-nums
                    text-gray-400
                dark:text-zinc-500"
      >
        Showing{" "}
        <span className="text-gray-700 dark:text-zinc-300">
          {from}–{to}
        </span>{" "}
        of <span className="text-gray-700 dark:text-zinc-300">{total}</span>{" "}
        items
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 disabled:opacity-30
                     text-gray-400 hover:text-gray-700 hover:bg-gray-100
                 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-zinc-800"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="px-1 text-xs text-gray-400 dark:text-zinc-600"
            >
              …
            </span>
          ) : (
            <Button
              key={p}
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 text-xs rounded-md",
                p === currentPage
                  ? "bg-gray-200      text-gray-900      font-semibold dark:bg-zinc-700 dark:text-white"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-zinc-800"
              )}
              onClick={() => onPageChange(p as number)}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 disabled:opacity-30
                     text-gray-400 hover:text-gray-700 hover:bg-gray-100
                 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-zinc-800"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
