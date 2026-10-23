"use client";

// features/admin/queue/components/queue-table.tsx

import { formatDistanceToNow, format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ImageIcon, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { QueueItem } from "../types/queue-types";
import { QueueStatusBadge } from "./queue-status-badge";
import { QueueRetryButton } from "./queue-retry-button";
import { PlatformBadge } from "./platform-badge";

interface QueueTableProps {
  items: QueueItem[];
  retryingIds: Set<string>;
  onRetry: (item: QueueItem) => void;
  isLoading?: boolean;
}

function truncate(str: string, max: number) {
  if (!str) return "—";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

function fmtScheduled(iso: string) {
  const d = new Date(iso);
  return {
    date: format(d, "dd MMM yyyy"),
    time: format(d, "HH:mm"),
    relative: formatDistanceToNow(d, { addSuffix: true, locale: localeId }),
  };
}

function fmtAttempt(iso: string | null) {
  if (!iso) return "—";
  return formatDistanceToNow(new Date(iso), {
    addSuffix: true,
    locale: localeId,
  });
}

const HEADERS = [
  "Content",
  "Platform",
  "Scheduled",
  "Status",
  "Retries",
  "Last Attempt",
  "Error",
  "",
];

export function QueueTable({
  items,
  retryingIds,
  onRetry,
  isLoading,
}: QueueTableProps) {
  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden transition-opacity duration-200",
        // light
        "bg-white border-gray-200",
        // dark
        "dark:bg-zinc-900/50 dark:border-zinc-800",
        isLoading && "opacity-50 pointer-events-none"
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-gray-200 dark:border-zinc-800">
            {HEADERS.map((h) => (
              <TableHead
                key={h}
                className="text-xs font-medium uppercase tracking-widest h-9 px-4 text-gray-400 dark:text-zinc-500"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((item, idx) => {
            const scheduled = fmtScheduled(item.scheduled_at);
            const isRetrying = retryingIds.has(item.id);
            const isOdd = idx % 2 === 1;
            const hasMedia = item.media_urls.length > 0;

            return (
              <TableRow
                key={item.id}
                className={cn(
                  "group transition-colors",
                  "border-gray-100 hover:bg-gray-50",
                  "dark:border-zinc-800/60 dark:hover:bg-zinc-800/40",
                  isOdd
                    ? "bg-gray-50/60 dark:bg-zinc-900/20"
                    : "bg-white dark:bg-transparent"
                )}
              >
                {/* ── Content ───────────────────────────────────────── */}
                <TableCell className="px-4 py-3 max-w-[280px] whitespace-normal align-top">
                  <div className="flex items-start gap-2 min-w-0">
                    {hasMedia &&
                      (() => {
                        // 1. Ambil URL (Handle jika string langsung atau berupa object)
                        const rawMedia = item.media_urls[0];
                        const mediaUrl =
                          typeof rawMedia === "string"
                            ? rawMedia
                            : rawMedia?.url;
                        const mediaType =
                          typeof rawMedia === "object"
                            ? rawMedia?.type
                            : "image";

                        if (!mediaUrl) return null;

                        return (
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={() =>
                                    window.open(
                                      mediaUrl,
                                      "_blank",
                                      "noopener,noreferrer"
                                    )
                                  }
                                  className="mt-0.5 shrink-0 relative flex h-5 w-5 items-center justify-center rounded bg-gray-100 text-gray-400 hover:text-gray-600 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                                >
                                  <ImageIcon className="h-3 w-3" />
                                  {item.media_urls.length > 1 && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-gray-500 px-0.5 text-[9px] font-medium leading-none text-white dark:bg-zinc-600">
                                      {item.media_urls.length}
                                    </span>
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent
                                side="right"
                                className="p-1 bg-white border-gray-200 dark:bg-zinc-800 dark:border-zinc-700"
                              >
                                {mediaType === "video" ? (
                                  // eslint-disable-next-line jsx-a11y/media-has-caption
                                  <video
                                    src={mediaUrl}
                                    className="h-24 w-24 rounded object-cover"
                                    muted
                                  />
                                ) : (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={mediaUrl}
                                    alt="Media preview"
                                    className="h-24 w-24 rounded object-cover"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src =
                                        "https://placehold.co/100x100/27272a/a1a1aa?text=No+Image";
                                    }}
                                  />
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })()}
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-sm leading-snug cursor-default text-gray-800 dark:text-zinc-200 break-words min-w-0">
                            {truncate(item.content, 80)}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="max-w-xs text-xs whitespace-pre-wrap bg-white border-gray-200 text-gray-800 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
                        >
                          {item.content}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>

                {/* ── Platform ──────────────────────────────────────── */}
                <TableCell className="px-4 py-3">
                  <PlatformBadge
                    platform={item.platform}
                    username={item.platform_user_name}
                  />
                </TableCell>

                {/* ── Scheduled ─────────────────────────────────────── */}
                <TableCell className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium tabular-nums text-gray-800 dark:text-zinc-200">
                      {scheduled.date}
                    </span>
                    <span className="text-[11px] tabular-nums text-gray-400 dark:text-zinc-500">
                      {scheduled.time} · {scheduled.relative}
                    </span>
                  </div>
                </TableCell>

                {/* ── Status ────────────────────────────────────────── */}
                <TableCell className="px-4 py-3">
                  <QueueStatusBadge status={item.status} />
                </TableCell>

                {/* ── Retries ───────────────────────────────────────── */}
                <TableCell className="px-4 py-3">
                  <span
                    className={cn(
                      "text-xs tabular-nums font-mono",
                      item.retry_count >= item.max_retries
                        ? "text-rose-500"
                        : item.retry_count > 0
                        ? "text-amber-500"
                        : "text-gray-400 dark:text-zinc-500"
                    )}
                  >
                    {item.retry_count}/{item.max_retries}
                  </span>
                </TableCell>

                {/* ── Last Attempt ──────────────────────────────────── */}
                <TableCell className="px-4 py-3">
                  <span className="text-xs tabular-nums text-gray-400 dark:text-zinc-500">
                    {fmtAttempt(item.last_attempt_at)}
                  </span>
                </TableCell>

                {/* ── Error ─────────────────────────────────────────── */}
                <TableCell className="px-4 py-3 max-w-[200px] whitespace-normal align-top">
                  {item.error_log ? (
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5 cursor-default">
                            <AlertTriangle className="h-3 w-3 text-rose-500 shrink-0" />
                            <span className="text-xs text-rose-500 truncate max-w-[160px]">
                              {truncate(item.error_log, 40)}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="left"
                          className="max-w-xs text-xs font-mono whitespace-pre-wrap bg-white border-gray-200 text-rose-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-rose-300"
                        >
                          {item.error_log}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="text-gray-300 dark:text-zinc-700">—</span>
                  )}
                </TableCell>

                {/* ── Actions ───────────────────────────────────────── */}
                <TableCell className="px-4 py-3">
                  <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <QueueRetryButton
                      item={item}
                      isRetrying={isRetrying}
                      onRetry={onRetry}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
