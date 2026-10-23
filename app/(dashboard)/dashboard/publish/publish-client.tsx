// app/dashboard/publish/publish-client
"use client";

import { useState, useCallback, useEffect, useTransition } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { List, CalendarDays, Plus, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Post, PlatformFilter, ViewMode } from "@/features/post/types";
import SmartQueueBanner from "@/features/post/components/smart-queue-banner";
import StatsRow from "@/features/post/components/stats-row";
import PlatformFilters from "@/features/post/components/platform-filter";
import EmptyState from "@/features/post/components/empty-state";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { usePostModalContext } from "@/features/post/context/post-modal-context";
import PostCard from "@/features/post/components/post-card";
import dynamic from "next/dynamic";
import {
  CalendarEvent,
  getCalendarPosts,
} from "@/features/calendar/actions/get-calendar-posts";
import CalendarView from "@/features/calendar/components/calendar-view";
import { toast } from "sonner";

const PostModal = dynamic(() => import("@/features/post/post-modal"), {
  ssr: false,
});

// ── Props ──────────────────────────────────────────────────────────────────
type Props = {
  initialPosts: Post[];
};

const SUCCESS_MESSAGES: Record<string, string> = {
  instagram_connected: "Akun instagram berhasil terhubung!",
  linkedin_connected: "Akun linkedin berhasil terhubung!",
  account_already_connected: "Akun ini sudah terhubung ke pengguna lain",
};

export default function PublishClient({ initialPosts }: Props) {
  const { openModal, isOpen } = usePostModalContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();
  const [activeTab, setActiveTab] = useState("queue");

  useEffect(() => {
    const success = searchParams.get("success");
    if (!success) return;

    toast.success(SUCCESS_MESSAGES[success] ?? "Berhasil terhubung");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("success");
    params.delete("error");
    router.replace(pathName);
  }, [searchParams, router, pathName]);

  // const activeTab = searchParams.get("tab") ?? "queue";

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // ── UI State ────────────────────────────────────────────────────────────
  const [view, setView] = useState<ViewMode>("list");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");

  // ── Calendar State ──────────────────────────────────────────────────────
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  // ── Filtering ───────────────────────────────────────────────────────────
  const filtered = initialPosts.filter((post) =>
    platformFilter === "all" ? true : post.platform === platformFilter,
  );

  const queuedPosts = filtered.filter((p) => p.status === "queued");
  const draftPosts = filtered.filter((p) => p.status === "draft");
  const publishedPosts = filtered.filter((p) => p.status === "published");
  const failedPosts = filtered.filter((p) => p.status === "failed");

  // ── View Change Handler ─────────────────────────────────────────────────
  const handleViewChange = useCallback(
    async (newView: ViewMode) => {
      setView(newView);

      // Fetch calendar events hanya saat pertama kali buka calendar view
      if (newView === "calendar" && calendarEvents.length === 0) {
        setCalendarLoading(true);
        try {
          const events = await getCalendarPosts();
          setCalendarEvents(events);
        } finally {
          setCalendarLoading(false);
        }
      }
    },
    [calendarEvents.length],
  );

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto min-h-screen bg-white">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">
            Publish
          </h1>
          <p className="text-sm text-gray-400 mt-0.5 font-medium">
            Manage & schedule posts across all channels
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-gray-50 p-0.5 rounded-xl border border-gray-100 h-9 items-center">
            <button
              onClick={() => handleViewChange("list")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] text-xs font-semibold transition-all",
                view === "list"
                  ? "bg-white shadow-sm text-gray-800 border border-gray-100"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              <List
                size={14}
                className={view === "list" ? "text-[#4F7A28]" : ""}
              />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => handleViewChange("calendar")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] text-xs font-semibold transition-all",
                view === "calendar"
                  ? "bg-white shadow-sm text-gray-800 border border-gray-100"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              <CalendarDays
                size={14}
                className={view === "calendar" ? "text-[#4F7A28]" : ""}
              />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>

          <Button
            onClick={openModal}
            className="bg-[#065f46] hover:bg-[#053b2c] text-white border-none shadow-none font-bold rounded-xl h-9 px-4 text-xs gap-1.5"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>New Post</span>
          </Button>
        </div>
      </div>

      <SmartQueueBanner />
      <StatsRow
        queued={queuedPosts.length}
        drafts={draftPosts.length}
        sent={publishedPosts.length}
      />

      {/* CALENDAR VIEW */}
      {view === "calendar" && (
        <div className="mt-2">
          {calendarLoading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 py-20 flex justify-center">
              <Loader2 className="animate-spin text-[#4F7A28]" />
            </div>
          ) : (
            <CalendarView initialEvents={calendarEvents} />
          )}
        </div>
      )}

      {/* LIST VIEW */}
      {view === "list" && (
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="border-b border-gray-100 overflow-x-auto no-scrollbar">
              <TabsList className="bg-transparent w-full justify-start rounded-none h-auto p-0 space-x-5 min-w-max">
                {[
                  { value: "queue", label: "Queue", count: queuedPosts.length },
                  {
                    value: "drafts",
                    label: "Drafts",
                    count: draftPosts.length,
                  },
                  {
                    value: "published",
                    label: "Published",
                    count: publishedPosts.length,
                  },
                  {
                    value: "failed",
                    label: "Failed",
                    count: failedPosts.length,
                  },
                ].map(({ value, label, count }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="relative rounded-none border-b-2 border-transparent px-1 py-3 text-sm font-semibold text-gray-400 data-[state=active]:border-[#4F7A28] data-[state=active]:text-gray-900 bg-transparent transition-all gap-2"
                  >
                    {label}
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded-md text-[10px] text-gray-400 font-bold">
                      {count}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Filter size={13} className="text-gray-400 shrink-0" />
              <PlatformFilters
                active={platformFilter}
                onChange={setPlatformFilter}
              />
            </div>
          </div>

          <TabsContent value="queue">
            {queuedPosts.length > 0 ? (
              <div className="space-y-3">
                {queuedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Queue kosong"
                description="Jadwalkan post dan post akan muncul di sini."
              />
            )}
          </TabsContent>

          <TabsContent value="drafts">
            {draftPosts.length > 0 ? (
              <div className="space-y-3">
                {draftPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Belum ada draft"
                description="Post draft akan muncul di sini."
              />
            )}
          </TabsContent>

          <TabsContent value="published">
            {publishedPosts.length > 0 ? (
              <div className="space-y-3">
                {publishedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Belum ada post yang dikirim"
                description="Post published akan muncul di sini."
              />
            )}
          </TabsContent>

          <TabsContent value="failed">
            {failedPosts.length > 0 ? (
              <div className="space-y-3">
                {failedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Tidak ada post gagal"
                description="Post yang gagal publish akan muncul di sini."
              />
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Modal buat post baru */}
      {isOpen && <PostModal />}
    </div>
  );
}
