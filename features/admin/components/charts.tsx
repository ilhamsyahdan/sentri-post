"use client";

import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type {
  ThroughputPoint,
  SuccessRatePoint,
  PlatformStat,
} from "@/features/admin/types/admin.types";
import { fmtHour, fmtDate, fmt, platformLabel } from "../utils/formatters";
import { SectionHeader, EmptyState } from "./ui";

// helper melengkapi data 24 jam
function fill24HoursData(data: ThroughputPoint[]): ThroughputPoint[] {
  if (!data?.length) return [];

  const dataMap = new Map<number, ThroughputPoint>();

  for (const d of data) {
    const formatted = fmtHour(d.hour); // contoh: "20:00"
    const hour = Number(formatted.split(":")[0]);

    dataMap.set(hour, d);
  }

  return Array.from({ length: 24 }, (_, h) => {
    const existing = dataMap.get(h);

    return {
      hour: String(h).padStart(2, "0"),
      published: existing?.published ?? 0,
      failed: existing?.failed ?? 0,
      queued: existing?.queued ?? 0,
    };
  });
}

// ── Tooltip shell ─────────────────────────────────────────────────────────────
function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white shadow-xl px-3 py-2.5 text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
      {children}
    </div>
  );
}

// ── Throughput chart ──────────────────────────────────────────────────────────
export function ThroughputChart({ data }: { data: ThroughputPoint[] }) {
  const fullData = fill24HoursData(data);

  const rows = fullData.map((d) => ({
    ...d,
    formattedHour: fmtHour(d.hour),
  }));

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/60 backdrop-blur-sm">
      <SectionHeader
        title="Publishing throughput"
        description="Last 24h per hour"
      />
      {!data.length ? (
        <EmptyState icon="📊" title="No throughput data yet" />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart
              data={rows}
              barSize={8}
              barGap={3}
              margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="2 4"
                stroke="currentColor"
                className="text-zinc-100 dark:text-zinc-800/60"
              />
              <XAxis
                dataKey="formattedHour"
                tick={{
                  fill: "#a1a1aa",
                  fontSize: 10,
                  fontFamily: "monospace",
                }}
                axisLine={false}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{
                  fill: "#a1a1aa",
                  fontSize: 10,
                  fontFamily: "monospace",
                }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(161, 161, 170, 0.08)" }}
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <Tip>
                      <p className="text-zinc-500 dark:text-zinc-400 mb-1.5 font-medium text-xs">
                        {label}
                      </p>
                      {payload.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 mb-0.5 text-xs"
                        >
                          <span
                            className="w-2 h-2 rounded-sm"
                            style={{ background: p.color as string }}
                          />
                          <span className="text-zinc-600 dark:text-zinc-300 capitalize">
                            {p.name as string}
                          </span>
                          <span className="ml-auto pl-4 font-mono text-zinc-900 dark:text-zinc-100 font-semibold">
                            {p.value as number}
                          </span>
                        </div>
                      ))}
                    </Tip>
                  ) : null
                }
              />
              <Bar dataKey="published" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="failed" fill="#f87171" radius={[2, 2, 0, 0]} />
              <Bar dataKey="queued" fill="#60a5fa" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="flex gap-4 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
            {[
              ["Published", "#10b981"],
              ["Failed", "#f87171"],
              ["Queued", "#60a5fa"],
            ].map(([l, c]) => (
              <div key={l} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ background: c }}
                />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {l}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Success rate trend ────────────────────────────────────────────────────────
export function SuccessRateChart({ data }: { data: SuccessRatePoint[] }) {
  const rows = data.map((d) => ({ ...d, date: fmtDate(d.date) }));
  const avg = data.length
    ? data.reduce((s, d) => s + d.successRate, 0) / data.length
    : 0;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/60 backdrop-blur-sm">
      <SectionHeader
        title="Success rate"
        description="7-day"
        badge={`${avg.toFixed(1)}% avg`}
      />
      {!data.length ? (
        <EmptyState icon="📈" title="No trend data yet" />
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart
            data={rows}
            margin={{ top: 4, right: 4, bottom: 0, left: -24 }}
          >
            <defs>
              <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="2 4"
              stroke="currentColor"
              className="text-zinc-100 dark:text-zinc-800/60"
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "#71717a", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={1}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#71717a", fontSize: 10, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <Tip>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-1">
                      {label}
                    </p>
                    <p
                      className="font-mono text-xl font-semibold"
                      style={{
                        color:
                          Number(payload[0]?.value) >= 95
                            ? "#10b981"
                            : Number(payload[0]?.value) >= 80
                              ? "#f59e0b"
                              : "#ef4444",
                      }}
                    >
                      {Number(payload[0]?.value).toFixed(1)}%
                    </p>
                  </Tip>
                ) : null
              }
            />
            <ReferenceLine
              y={95}
              stroke="#10b981"
              strokeDasharray="3 6"
              strokeOpacity={0.4}
            />
            <Area
              type="monotone"
              dataKey="successRate"
              stroke="#10b981"
              strokeWidth={1.5}
              fill="url(#gr)"
              dot={false}
              activeDot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ── Platform breakdown ────────────────────────────────────────────────────────
const icons: Record<string, string> = {
  twitter: "𝕏",
  linkedin: "in",
  instagram: "◎",
  facebook: "f",
  tiktok: "♪",
  bluesky: "☁",
};

export function PlatformBreakdown({ data }: { data: PlatformStat[] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/60 backdrop-blur-sm">
      <SectionHeader title="By platform" description="Last 7 days" />
      {!data.length ? (
        <EmptyState icon="🌐" title="No platform data" />
      ) : (
        <div className="space-y-4">
          {data.map((s) => (
            <div key={s.platform}>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-xs font-bold text-zinc-400 w-5 text-center dark:text-zinc-500">
                  {icons[s.platform] ?? "?"}
                </span>
                <span className="text-xs text-zinc-700 flex-1 dark:text-zinc-300">
                  {platformLabel(s.platform)}
                </span>
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  {fmt(s.published)}
                </span>
                <span
                  className={`text-xs font-mono w-10 text-right ${
                    s.successRate >= 95
                      ? "text-emerald-600 dark:text-emerald-400"
                      : s.successRate >= 80
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {s.successRate}%
                </span>
              </div>

              <div className="h-1 bg-zinc-100 rounded-full overflow-hidden ml-7 dark:bg-zinc-800">
                <div
                  className={`h-full rounded-full transition-all ${
                    s.successRate >= 95
                      ? "bg-emerald-500"
                      : s.successRate >= 80
                        ? "bg-amber-400"
                        : "bg-red-400"
                  }`}
                  style={{ width: `${s.successRate}%` }}
                />
              </div>

              <p className="text-[10px] text-zinc-400 mt-1 ml-7 dark:text-zinc-500">
                {fmt(s.failed)} failed
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
