"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Heart,
  Eye,
  Bookmark,
  RefreshCw,
  BarChart2,
  Calendar,
  ChevronDown,
  Zap,
  Info,
  MessageCircle,
} from "lucide-react";

import { logger } from "@/lib/logger";
import { getAnalyticsPosts } from "../actions/get-analytics";
import { refreshAnalytics } from "../actions/refresh-analytics";
import { AnalyticsPost, Platform, Props } from "../types/analytics";
import { fmt, fmtDate } from "../utils/formatters";
import { computeSummary } from "../utils/computed-summary";
import { buildChartData } from "../utils/build-chart-data";
import { getTopPost } from "../utils/get-top-post";
import { PLATFORM_CONFIG, SortKey } from "../config/platform-config";
import { CHART_COLORS } from "../constants/chart-colors";
import { MIN_RELIABLE_REACH } from "../constants/thresholds";
import { useTrends } from "../hooks/use-trends";

import { KPICard } from "./kpi-card";
import { PostRow } from "./post-row";
import { EngagementLegend } from "./engagement-legend";
import { ChartTooltip } from "./chart-tooltip";
import { EngTooltip } from "./engagement-tooltip";

export default function AnalyticsClient({ initialPosts }: Props) {
  const availablePlatforms = useMemo(
    () =>
      (Object.keys(PLATFORM_CONFIG) as Platform[]).filter(
        (pl) =>
          PLATFORM_CONFIG[pl].supportsAnalytics &&
          initialPosts.some((p) => p.platform === pl)
      ),
    [initialPosts]
  );

  const defaultPlatform: Platform = availablePlatforms[0] ?? "instagram";

  const [posts, setPosts] = useState<AnalyticsPost[]>(initialPosts);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [platformFilter, setPlatformFilter] =
    useState<Platform>(defaultPlatform);
  const activePlatformConfig = PLATFORM_CONFIG[platformFilter];

  const [chartMetric, setChartMetric] = useState<
    "likes" | "reach" | "saved" | "comments"
  >(activePlatformConfig?.metrics.hasViews ? "reach" : "likes");

  const [activeTab, setActiveTab] = useState<"overview" | "posts">("overview");

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      await refreshAnalytics(posts.map((p) => ({ targetId: p.targetId })));
      await new Promise((r) => setTimeout(r, 2500));
      const fresh = await getAnalyticsPosts();
      setPosts(fresh);
    } catch (error) {
      logger.error("Gagal refresh analytics", error, { platformFilter });
    } finally {
      setIsRefreshing(false);
    }
  }

  const filteredPosts = useMemo(
    () =>
      posts.filter(
        (p) =>
          p.platform === platformFilter &&
          PLATFORM_CONFIG[p.platform].supportsAnalytics
      ),
    [posts, platformFilter]
  );

  const summary = useMemo(() => computeSummary(filteredPosts), [filteredPosts]);
  const chartData = useMemo(
    () => buildChartData(filteredPosts),
    [filteredPosts]
  );

  const engagementChartData = useMemo(() => {
    const sorted = [...filteredPosts]
      .filter((post) => post.views >= MIN_RELIABLE_REACH)
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      )
      .slice(-12);

    const dateCounters = new Map<string, number>();

    return sorted.map((post) => {
      const date = new Date(post.scheduledAt);

      const dateLabel = date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });

      const time = date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const currentCount = (dateCounters.get(dateLabel) ?? 0) + 1;
      dateCounters.set(dateLabel, currentCount);

      const cappedER = Math.min(post.engagementRate, 100);

      return {
        id: post.targetId,
        date: `${dateLabel} #${currentCount}`,
        dateLabel,
        time,
        postNumber: currentCount,
        content: post.content,
        likes: post.likes,
        comments: post.comments,
        reach: post.views,
        saved: post.saved,
        engagement: Number(cappedER.toFixed(2)),
      };
    });
  }, [filteredPosts]);

  const trends = useTrends(filteredPosts);

  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      if (sortBy === "engagement") return b.engagementRate - a.engagementRate;
      if (sortBy === "likes") return b.likes - a.likes;
      if (sortBy === "comments") return b.comments - a.comments;
      if (sortBy === "reach") return b.views - a.views;
      return (
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
      );
    });
  }, [filteredPosts, sortBy]);

  // Bug lama (reduce di array kosong tanpa initial value) sudah diperbaiki
  // di dalam getTopPost() — lihat utils/get-top-post.ts
  const topPost = useMemo(() => getTopPost(filteredPosts), [filteredPosts]);

  const metricOptions = [
    {
      key: "reach" as const,
      label: "Reach",
      show: activePlatformConfig.metrics.hasViews,
    },
    { key: "likes" as const, label: "Likes", show: true },
    {
      key: "saved" as const,
      label: "Saved",
      show: activePlatformConfig.metrics.hasSaved,
    },
    { key: "comments" as const, label: "Comments", show: true },
  ];

  const sortOptions: { value: SortKey; label: string }[] = [
    { value: "date", label: "Terbaru" },
    { value: "engagement", label: "Engagement" },
    { value: "likes", label: "Likes" },
    ...(activePlatformConfig.metrics.hasViews
      ? [{ value: "reach" as SortKey, label: "Reach" }]
      : []),
    { value: "comments", label: "Comments" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${activePlatformConfig.gradient.from}, ${activePlatformConfig.gradient.to})`,
                }}
              >
                <Image
                  src={activePlatformConfig.icon}
                  width={14}
                  height={14}
                  alt={activePlatformConfig.label}
                  className="object-contain"
                />
              </div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">
                {activePlatformConfig.label} Analytics
              </h1>
            </div>
            <p className="text-sm text-gray-400">
              {filteredPosts.length} post · {summary.publishedCount} dengan data
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-500 hover:border-gray-300 hover:text-gray-800 transition-all disabled:opacity-40 shadow-sm"
          >
            <RefreshCw
              size={13}
              className={isRefreshing ? "animate-spin" : ""}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Platform Tabs */}
        {availablePlatforms.length > 1 && (
          <div className="flex bg-white border border-gray-100 rounded-xl p-1 mb-4 w-fit shadow-sm gap-1">
            {availablePlatforms.map((pl) => {
              const cfg = PLATFORM_CONFIG[pl];
              const isActive = platformFilter === pl;
              return (
                <button
                  key={pl}
                  onClick={() => {
                    setPlatformFilter(pl);
                    if (
                      !PLATFORM_CONFIG[pl].metrics.hasViews &&
                      chartMetric === "reach"
                    ) {
                      setChartMetric("likes");
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#005038] text-white shadow-xs"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                >
                  <Image
                    src={cfg.icon}
                    width={11}
                    height={11}
                    alt={cfg.label}
                    className="object-contain"
                  />
                  {cfg.label}
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {posts.filter((p) => p.platform === pl).length}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-6 w-fit shadow-sm">
          {(["overview", "posts"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-[10px] text-xs font-semibold capitalize transition-all ${
                activeTab === tab
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              {tab === "overview" ? "Overview" : "Semua Post"}
            </button>
          ))}
        </div>

        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-gray-100 rounded-3xl text-center bg-white">
            <BarChart2 size={40} className="text-gray-200 mb-3" />
            <p className="text-sm font-semibold text-gray-400">
              Belum ada data analytics
            </p>
            <p className="text-xs text-gray-300 mt-1">
              Analytics muncul setelah post berhasil dipublish di{" "}
              {activePlatformConfig.label}
            </p>
          </div>
        ) : activeTab === "overview" ? (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <KPICard
                label="Avg Engagement"
                value={`${summary.avgEngagement.toFixed(2)}%`}
                sub={`${summary.publishedCount} post`}
                icon={Zap}
                iconColor="#ffffff"
                iconBg="rgba(255,255,255,0.15)"
                trend={trends.engagement}
                highlight
              />
              {activePlatformConfig.metrics.hasViews && (
                <KPICard
                  label="Total Reach"
                  value={fmt(summary.totalViews)}
                  sub="unik per post"
                  icon={Eye}
                  iconColor="#F77737"
                  iconBg="#FFF3E0"
                  trend={trends.views}
                />
              )}
              <KPICard
                label="Total Likes"
                value={fmt(summary.totalLikes)}
                sub="semua post"
                icon={Heart}
                iconColor="#E1306C"
                iconBg="#FCE4EC"
                trend={trends.likes}
              />
              {activePlatformConfig.metrics.hasSaved && (
                <KPICard
                  label="Total Saved"
                  value={fmt(summary.totalSaved)}
                  sub="bookmark"
                  icon={Bookmark}
                  iconColor="#405DE6"
                  iconBg="#EDE7F6"
                  trend={trends.saved}
                />
              )}
              {activePlatformConfig.metrics.hasShares && (
                <KPICard
                  label="Total Shares"
                  value={fmt(
                    posts
                      .filter((p) => p.platform === platformFilter)
                      .reduce((s, p) => s + p.shares, 0)
                  )}
                  sub="reposts"
                  icon={MessageCircle}
                  iconColor={activePlatformConfig.color}
                  iconBg={activePlatformConfig.iconBg}
                />
              )}
            </div>

            {/* Chart */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    Tren Performa
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {chartData.length} post terakhir
                  </p>
                </div>
                <div className="flex bg-gray-50 p-0.5 rounded-lg border border-gray-100 gap-0.5">
                  {metricOptions
                    .filter((m) => m.show)
                    .map((m) => (
                      <button
                        key={m.key}
                        onClick={() => setChartMetric(m.key)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                          chartMetric === m.key
                            ? "bg-white shadow-sm text-gray-800 border border-gray-100"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                </div>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="chartGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={CHART_COLORS[chartMetric]}
                          stopOpacity={0.18}
                        />
                        <stop
                          offset="95%"
                          stopColor={CHART_COLORS[chartMetric]}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#9CA3AF" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#9CA3AF" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={fmt}
                    />
                    <Tooltip content={<ChartTooltip metric={chartMetric} />} />
                    <Area
                      type="monotone"
                      dataKey={chartMetric}
                      stroke={CHART_COLORS[chartMetric]}
                      strokeWidth={2.5}
                      fill="url(#chartGrad)"
                      dot={{
                        r: 3,
                        fill: CHART_COLORS[chartMetric],
                        strokeWidth: 0,
                      }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Engagement + Top Post */}
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 mb-0.5">
                      Engagement Rate
                    </h2>
                    <p className="text-[11px] text-gray-400">per post</p>
                  </div>
                  <EngagementLegend />
                </div>

                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={engagementChartData}
                      margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                      barCategoryGap="22%"
                    >
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 9, fill: "#9CA3AF" }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 9, fill: "#9CA3AF" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        content={<EngTooltip />}
                        cursor={{ fill: "#F9FAFB" }}
                      />
                      <Bar
                        dataKey="engagement"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={24}
                      >
                        {engagementChartData.map((entry) => (
                          <Cell
                            key={entry.id}
                            fill={
                              entry.engagement >= 3
                                ? "#10B981"
                                : entry.engagement >= 1
                                ? "#F59E0B"
                                : "#D1D5DB"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {topPost && (
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-lg bg-amber-50 flex items-center justify-center">
                      <TrendingUp size={11} className="text-amber-500" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900">
                      Post Terbaik
                    </h2>
                  </div>

                  <div className="flex-1 bg-linear-to-br from-gray-50 to-gray-100/50 rounded-xl p-3.5 mb-3">
                    <p className="text-xs text-gray-700 leading-relaxed font-medium line-clamp-3">
                      {topPost.content}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                      <Calendar size={9} />
                      {fmtDate(topPost.scheduledAt)}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        icon: Zap,
                        value: `${topPost.engagementRate.toFixed(2)}%`,
                        label: "Eng.",
                        color: "#10B981",
                        show: true,
                      },
                      {
                        icon: Eye,
                        value: fmt(topPost.views),
                        label: "Reach",
                        color: "#F77737",
                        show: activePlatformConfig.metrics.hasViews,
                      },
                      {
                        icon: Heart,
                        value: fmt(topPost.likes),
                        label: "Likes",
                        color: "#E1306C",
                        show: true,
                      },
                      {
                        icon: Bookmark,
                        value: fmt(topPost.saved),
                        label: "Saved",
                        color: "#405DE6",
                        show: activePlatformConfig.metrics.hasSaved,
                      },
                    ]
                      .filter((m) => m.show)
                      .map((m) => (
                        <div key={m.label} className="text-center">
                          <m.icon
                            size={12}
                            className="mx-auto mb-0.5"
                            style={{ color: m.color }}
                          />
                          <p className="text-sm font-black text-gray-900">
                            {m.value}
                          </p>
                          <p className="text-[9px] text-gray-400">{m.label}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Posts Tab */
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <p className="text-sm font-bold text-gray-900">
                {sortedPosts.length} Post
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400 font-medium">
                  Urutkan:
                </span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortKey)}
                    className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-7 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-gray-400 cursor-pointer"
                  >
                    {sortOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={11}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-50 px-3">
              {sortedPosts.map((post, i) => (
                <PostRow key={post.targetId} post={post} rank={i + 1} />
              ))}
            </div>
          </div>
        )}

        <p className="mt-6 text-[10px] text-gray-300 text-center flex items-center justify-center gap-1.5">
          <Info size={9} />
          Engagement Rate = (Likes + Comments + Saved) / Reach × 100
        </p>
      </div>
    </div>
  );
}
