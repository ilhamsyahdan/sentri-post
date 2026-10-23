import type {
  ActivityEvent,
  FailedJob,
  QueueEntry,
} from "@/features/admin/types/admin.types";
import { fmtRelative, fmtDateTime, platformLabel } from "../utils/formatters";
import { StatusBadge, SectionHeader, EmptyState } from "./ui";

// ── Failed Jobs ───────────────────────────────────────────────────────────────
export function FailedJobsTable({ jobs }: { jobs: FailedJob[] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800/80 dark:bg-zinc-900/60 backdrop-blur-sm">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80">
        <SectionHeader
          title="Failed jobs"
          description="Retryable and permanent"
          badge={jobs.length}
        />
      </div>
      {!jobs.length ? (
        <EmptyState
          icon="✓"
          title="No failed jobs"
          description="All targets are running clean."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/60 dark:border-zinc-800/80 dark:bg-zinc-800/30">
                {[
                  "Platform user",
                  "Content",
                  "Platform",
                  "Status",
                  "Error",
                  "Retries",
                  "Last attempt",
                ].map((c) => (
                  <th
                    key={c}
                    className="px-4 py-2.5 text-left font-semibold text-zinc-400 tracking-wide uppercase text-[10px] whitespace-nowrap dark:text-zinc-500"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {jobs.map((j) => (
                <tr
                  key={j.id}
                  className="hover:bg-zinc-50/70 transition-colors dark:hover:bg-zinc-800/40"
                >
                  {/* Platform username */}
                  <td className="px-4 py-3 font-mono text-zinc-600 whitespace-nowrap dark:text-zinc-300">
                    {j.platformUsername ? (
                      <>
                        <span className="text-zinc-400 dark:text-zinc-500">
                          @
                        </span>
                        {j.platformUsername}
                      </>
                    ) : (
                      <span className="text-zinc-300 dark:text-zinc-600 italic">
                        unknown
                      </span>
                    )}
                  </td>

                  {/* Post content */}
                  <td className="px-4 py-3 text-zinc-700 max-w-[180px] truncate dark:text-zinc-300">
                    {j.postContent ? (
                      j.postContent
                    ) : (
                      <span className="text-zinc-300 dark:text-zinc-600 italic">
                        No content
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-zinc-500 whitespace-nowrap dark:text-zinc-400">
                    {platformLabel(j.platform)}
                  </td>

                  <td className="px-4 py-3 text-zinc-400 whitespace-nowrap font-mono dark:text-zinc-500">
                    <StatusBadge status={j.status} />
                  </td>

                  {/* Error log */}
                  <td className="px-4 py-3 text-zinc-400 max-w-[220px] truncate font-mono dark:text-zinc-400">
                    {j.errorLog ?? (
                      <span className="text-zinc-200 dark:text-zinc-700 font-sans not-italic">
                        —
                      </span>
                    )}
                  </td>

                  {/* Retry count badge */}
                  <td className="px-4 py-3 text-center tabular-nums">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded font-mono ${
                        j.retryCount >= 3
                          ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                          : j.retryCount >= 1
                          ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                          : "text-zinc-400 dark:text-zinc-500"
                      }`}
                    >
                      {j.retryCount}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-zinc-400 whitespace-nowrap font-mono dark:text-zinc-500">
                    {fmtRelative(j.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Active Queue ──────────────────────────────────────────────────────────────
export function ActiveQueueTable({ entries }: { entries: QueueEntry[] }) {
  const pub = entries.filter((e) => e.status === "publishing").length;
  const que = entries.filter((e) => e.status === "queued").length;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/60 backdrop-blur-sm">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80">
        <SectionHeader
          title="Active queue"
          description="Queued and in-flight"
          badge={entries.length}
          action={
            <div className="flex gap-3 text-xs text-zinc-400 dark:text-zinc-500">
              <span>
                <span className="font-mono text-amber-600 dark:text-amber-400">
                  {pub}
                </span>{" "}
                publishing
              </span>
              <span>
                <span className="font-mono text-sky-600 dark:text-sky-400">
                  {que}
                </span>{" "}
                queued
              </span>
            </div>
          }
        />
      </div>
      {!entries.length ? (
        <EmptyState icon="◻" title="Queue is empty" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/60 dark:border-zinc-800/80 dark:bg-zinc-800/30">
                {[
                  "Status",
                  "Platform user",
                  "Content",
                  "Platform",
                  "Scheduled",
                ].map((c) => (
                  <th
                    key={c}
                    className="px-4 py-2.5 text-left font-semibold text-zinc-400 tracking-wide uppercase text-[10px] whitespace-nowrap dark:text-zinc-500"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {entries.map((e) => (
                <tr
                  key={e.id}
                  className="hover:bg-zinc-50/70 transition-colors dark:hover:bg-zinc-800/40"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={e.status} />
                  </td>

                  <td className="px-4 py-3 font-mono text-zinc-600 whitespace-nowrap dark:text-zinc-300">
                    {e.platformUsername ? (
                      <>
                        <span className="text-zinc-400 dark:text-zinc-500">
                          @
                        </span>
                        {e.platformUsername}
                      </>
                    ) : (
                      <span className="text-zinc-300 dark:text-zinc-600 italic">
                        unknown
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-zinc-700 max-w-[180px] truncate dark:text-zinc-300">
                    {e.postContent ?? (
                      <span className="text-zinc-300 dark:text-zinc-600 italic">
                        No content
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-zinc-500 whitespace-nowrap dark:text-zinc-400">
                    {platformLabel(e.platform)}
                  </td>

                  <td className="px-4 py-3 text-zinc-400 whitespace-nowrap font-mono dark:text-zinc-500">
                    {fmtDateTime(e.scheduledAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Activity Feed ─────────────────────────────────────────────────────────────

const dot: Record<string, string> = {
  published: "bg-emerald-400",
  failed: "bg-red-400",
  queued: "bg-sky-400",
};

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col dark:border-zinc-800/80 dark:bg-zinc-900/60 backdrop-blur-sm">
      <SectionHeader title="Recent activity" description="Live stream" />

      {!events.length ? (
        <EmptyState icon="~" title="No recent activity" />
      ) : (
        <div className="relative overflow-y-auto max-h-[300px] pr-1 mt-3">
          {/* Timeline line */}
          <div className="absolute left-[5px] top-2 bottom-2 w-px bg-zinc-100 dark:bg-zinc-800/80" />

          <div className="space-y-4">
            {events.map((ev) => (
              <div key={ev.id} className="relative flex gap-3 pl-1">
                {/* Dot */}
                <span
                  className={`relative flex-shrink-0 mt-1 z-10 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-zinc-900 ${
                    dot[ev.status] ?? "bg-zinc-300 dark:bg-zinc-600"
                  }`}
                />

                {/* Content */}
                <div className="flex-1 min-w-0 pb-4 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 last:pb-0">
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-snug">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      @{ev.userName}
                    </span>
                    {" · "}
                    <span className="capitalize text-zinc-500 dark:text-zinc-400">
                      {ev.status}
                    </span>
                    {" on "}
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {platformLabel(ev.platform)}
                    </span>
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-mono">
                    {fmtRelative(ev.updatedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
