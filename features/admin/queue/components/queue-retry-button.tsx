"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { QueueItem } from "../types/queue-types";

interface QueueRetryButtonProps {
  item: QueueItem;
  isRetrying: boolean;
  onRetry: (item: QueueItem) => void;
}

export function QueueRetryButton({
  item,
  isRetrying,
  onRetry,
}: QueueRetryButtonProps) {
  const disabled = !item.canRetry || isRetrying;

  const tooltipText = isRetrying
    ? "Retrying…"
    : !item.canRetry
    ? item.isTerminal && item.status === "published"
      ? "Already published"
      : "No retries remaining"
    : item.status === "failed_permanent"
    ? `Force retry (${item.retry_count}/${item.max_retries} attempts)`
    : `Retry (${item.retry_count}/${item.max_retries} attempts used)`;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 rounded-md",
              "text-zinc-400 hover:text-white hover:bg-zinc-700",
              "disabled:opacity-30 disabled:cursor-not-allowed",
              isRetrying && "text-amber-400"
            )}
            disabled={disabled}
            onClick={() => onRetry(item)}
            aria-label="Retry this queue item"
          >
            <RotateCcw
              className={cn("h-3.5 w-3.5", isRetrying && "animate-spin")}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="left"
          className="bg-zinc-800 border-zinc-700 text-zinc-200 text-xs"
        >
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
