"use client";

import { QueueTable } from "./queue-table";
import { QueueFiltersBar } from "./queue-filters-bar";
import { QueuePagination } from "./queue-pagination";
import { useQueue } from "../hooks/use-queue";
import {
  QueueEmptyState,
  QueueErrorState,
  QueueTableSkeleton,
} from "./queue-states";
import type { QueuePage } from "../types/queue-types";

interface QueueViewProps {
  initialData: QueuePage;
}

export function QueueView({ initialData }: QueueViewProps) {
  const {
    items,
    total,
    totalPages,
    currentPage,
    search,
    statuses,
    isLoading,
    error,
    retryingIds,
    handleSearchChange,
    handleStatusToggle,
    handlePageChange,
    handleRetry,
    refetch, // 💡 Ambil fungsi refetch dari hook dibanding reload browser
  } = useQueue(initialData);

  const hasFilters = search.length > 0 || statuses.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Filters ── */}
      <QueueFiltersBar
        activeStatuses={statuses}
        onStatusToggle={handleStatusToggle}
      />

      {/* ── Content ── */}
      {error ? (
        // 💡 Sekarang onRetry memanggil fungsi API internal, bukan reload halaman
        <QueueErrorState message={error} onRetry={refetch} />
      ) : isLoading && items.length === 0 ? (
        <QueueTableSkeleton />
      ) : items.length === 0 ? (
        <QueueEmptyState hasFilters={hasFilters} />
      ) : (
        <QueueTable
          items={items}
          retryingIds={retryingIds}
          onRetry={handleRetry}
          isLoading={isLoading}
        />
      )}

      {/* ── Pagination ── */}
      {items.length > 0 && (
        <QueuePagination
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
