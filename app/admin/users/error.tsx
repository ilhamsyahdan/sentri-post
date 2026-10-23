// app/admin/users/error.tsx
"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function UsersError({ error, reset }: Props) {
  useEffect(() => {
    // In production, forward to your observability tool (Sentry, Axiom, etc.)
    console.error("[UsersPage Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40">
        <AlertTriangle className="h-5 w-5 text-red-500" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          Failed to load users
        </p>
        <p className="mt-1 text-xs text-muted-foreground max-w-[280px]">
          {error.message ?? "An unexpected error occurred. Please try again."}
        </p>
        {error.digest && (
          <p className="mt-1 font-mono text-[10px] text-muted-foreground/50">
            {error.digest}
          </p>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={reset}
        className="gap-1.5 text-xs"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Try again
      </Button>
    </div>
  );
}
