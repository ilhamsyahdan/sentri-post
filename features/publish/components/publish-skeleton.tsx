// features/post/components/publish-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

// ── Sub-skeletons per section ─────────────────────────────────────────────
// Masing-masing dipisah supaya bisa di-reuse jika perlu,
// dan supaya mudah di-maintain kalau layout section berubah.

function HeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      {/* Title + subtitle */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Buttons: Bulk Edit | List/Calendar toggle | New Post */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-24 rounded-xl" />
        <Skeleton className="h-9 w-24 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  );
}

function SmartQueueBannerSkeleton() {
  // Banner strip — tinggi dan lebar mengikuti SmartQueueBanner asli
  return <Skeleton className="h-11 w-full rounded-xl mb-4" />;
}

function StatsRowSkeleton() {
  // 3 stat cards sejajar
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-100 p-3 space-y-2"
        >
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-6 w-8" />
        </div>
      ))}
    </div>
  );
}

function TabsHeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      {/* Tab triggers: Queue | Drafts | Published */}
      <div className="flex items-center gap-5 border-b border-gray-100 pb-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 pb-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-6 rounded-md" />
          </div>
        ))}
      </div>

      {/* Platform filter pills */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3 rounded" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-16 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function PostCardSkeleton() {
  // Mirror struktur PostCard:
  // [avatar] [platform badge] [content lines] [scheduled time] [actions]
  return (
    <div className="rounded-2xl border border-gray-100 p-4 space-y-3 bg-white">
      {/* Row 1: avatar + name + platform badge + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        {/* Action dots */}
        <Skeleton className="h-7 w-7 rounded-lg" />
      </div>

      {/* Row 2: content lines */}
      <div className="space-y-2 pl-[42px]">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <Skeleton className="h-3.5 w-3/4" />
      </div>

      {/* Row 3: scheduled time + engagement badge */}
      <div className="flex items-center justify-between pl-[42px]">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

// ── Main Skeleton ─────────────────────────────────────────────────────────
export default function PublishSkeleton() {
  return (
    <div
      className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto min-h-screen bg-white"
      aria-busy="true"
      aria-label="Memuat halaman publish..."
    >
      <HeaderSkeleton />
      <SmartQueueBannerSkeleton />
      <StatsRowSkeleton />
      <TabsHeaderSkeleton />

      {/* PostCard skeletons — 4 cukup untuk mengisi viewport tanpa layout shift */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
