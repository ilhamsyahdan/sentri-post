// features/admin/failed-jobs/components/ErrorLogCell.tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  log: string | null;
}

export function ErrorLogCell({ log }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!log) {
    return (
      <span className="text-xs italic text-slate-600">
        No error log captured
      </span>
    );
  }

  const preview = log.length > 80 ? log.slice(0, 80) + "…" : log;

  return (
    <div className="space-y-1">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-start gap-1.5 text-left text-xs text-red-400 hover:text-red-300"
      >
        {expanded ? (
          <ChevronDown className="mt-0.5 h-3 w-3 shrink-0" />
        ) : (
          <ChevronRight className="mt-0.5 h-3 w-3 shrink-0" />
        )}
        <span className="font-mono leading-relaxed">
          {expanded ? log : preview}
        </span>
      </button>

      {expanded && (
        <div className="ml-4 rounded border border-red-900/40 bg-red-950/30 p-2">
          <div className="mb-1 flex items-center gap-1 text-[10px] text-red-600">
            <Terminal className="h-2.5 w-2.5" />
            <span>Full error log</span>
          </div>
          <pre
            className={cn(
              "whitespace-pre-wrap break-all font-mono text-[10px] text-red-300",
              "max-h-32 overflow-y-auto"
            )}
          >
            {log}
          </pre>
        </div>
      )}
    </div>
  );
}
