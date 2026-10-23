"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  fetchQueuePageAction,
  retryQueueItemAction,
} from "../actions/queue-actions";
import { QueueItem, QueuePage, QueueStatus } from "../types/queue-types";

const DEFAULT_PAGE_SIZE = 20;

function parseStatuses(raw: string | null): QueueStatus[] {
  if (!raw) return [];
  return raw.split(",").filter(Boolean) as QueueStatus[];
}

export function useQueue(initialData?: QueuePage) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // ── Derive filter state from URL ──────────────────────────────────────────
  const search = searchParams.get("search") ?? "";
  const statuses = parseStatuses(searchParams.get("statuses"));
  const page = Number(searchParams.get("page") ?? "1");

  // ── Local data state ──────────────────────────────────────────────────────
  const [queuePage, setQueuePage] = useState<QueuePage | undefined>(
    initialData
  );
  const [error, setError] = useState<string | null>(null);
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set());

  // 💡 State tambahan untuk memicu re-fetch manual tanpa mengubah URL
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Debounce ref for search
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── URL state helpers ─────────────────────────────────────────────────────
  const updateUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      if (!("page" in updates)) params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  // ── 💡 Fungsi Refetch Eksternal ──────────────────────────────────────────
  // Dipanggil saat tombol error diklik, atau setelah aksi tertentu selesai
  const refetch = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // ── Fetch data ──────────────────────────────────────────────────────────
  useEffect(() => {
    startTransition(async () => {
      setError(null);
      const result = await fetchQueuePageAction({
        search: search || undefined,
        statuses: statuses.length > 0 ? statuses : undefined,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
      });
      if (result.ok) {
        setQueuePage(result.data);
      } else {
        setError(result.error);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, searchParams.get("statuses"), page, refreshTrigger]); // 💡 Tambahkan refreshTrigger di sini

  // ── Filter handlers ───────────────────────────────────────────────────────
  const handleSearchChange = useCallback(
    (value: string) => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
      searchDebounce.current = setTimeout(() => {
        updateUrl({ search: value || null });
      }, 350);
    },
    [updateUrl]
  );

  const handleStatusToggle = useCallback(
    (status: QueueStatus) => {
      const next = statuses.includes(status)
        ? statuses.filter((s) => s !== status)
        : [...statuses, status];
      updateUrl({ statuses: next.length > 0 ? next.join(",") : null });
    },
    [statuses, updateUrl]
  );

  const handlePageChange = useCallback(
    (p: number) => {
      updateUrl({ page: String(p) });
    },
    [updateUrl]
  );

  // ── Retry handler ─────────────────────────────────────────────────────────
  const handleRetry = useCallback(
    async (item: QueueItem) => {
      if (retryingIds.has(item.id)) return;

      setRetryingIds((prev) => new Set(prev).add(item.id));

      // Optimistic update
      setQueuePage((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.id === item.id
              ? { ...i, status: "queued" as QueueStatus, error_log: null }
              : i
          ),
        };
      });

      const result = await retryQueueItemAction(item.id);

      setRetryingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });

      if (!result.ok) {
        // Rollback optimistic update jika gagal ke server
        setQueuePage((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map((i) =>
              i.id === item.id ? { ...i, status: item.status } : i
            ),
          };
        });
        setError(result.error);
      } else {
        // 💡 BONUS QA: Jika retry sukses, panggil refetch agar data urutan antrean
        // yang paling aktual langsung ditarik dari database Supabase secara realtime
        refetch();
      }
    },
    [retryingIds, refetch]
  );

  return {
    items: queuePage?.items ?? [],
    total: queuePage?.total ?? 0,
    totalPages: queuePage?.totalPages ?? 1,
    currentPage: page,
    search,
    statuses,
    isLoading: isPending,
    error,
    retryingIds,
    handleSearchChange,
    handleStatusToggle,
    handlePageChange,
    handleRetry,
    refetch, // 💡 Ekspos fungsi ini ke komponen UI (QueueView)
  };
}
