"use client";

// app/admin/queue/error.tsx
// Next.js Error Boundary — catches server component throws

import { useEffect } from "react";
import { QueueErrorState } from "@/features/admin/queue/components/queue-states";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function QueueError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[QueuePage] Error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <QueueErrorState message={error.message} onRetry={reset} />
        {error.digest && (
          <p className="mt-3 text-center text-[10px] text-zinc-700 font-mono">
            digest: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
