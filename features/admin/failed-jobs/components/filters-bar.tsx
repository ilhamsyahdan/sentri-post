// features/admin/failed-jobs/components/FiltersBar.tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FailedJobsFilters, Platform } from "../types";

const PLATFORMS: { value: Platform | "all"; label: string }[] = [
  { value: "all", label: "All Platforms" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "tiktok", label: "TikTok" },
  { value: "twitter", label: "Twitter / X" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
];

const STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "failed", label: "Failed (retrying)" },
  { value: "failed_permanent", label: "Permanently Failed" },
];

interface Props {
  filters: FailedJobsFilters;
}

export function FiltersBar({ filters }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all" && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // reset page on filter change
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.replace(pathname);
    });
  }, [router, pathname]);

  const hasActiveFilters =
    filters.platform !== "all" ||
    filters.status !== "all" ||
    filters.search !== "";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative min-w-[240px] flex-1">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
        <Input
          defaultValue={filters.search}
          placeholder="Search user, content, username…"
          className="border-slate-700 bg-slate-800/60 pl-9 text-sm text-slate-200 placeholder:text-slate-500 focus:border-slate-500"
          onChange={(e) => {
            const val = e.target.value;
            const timeout = setTimeout(() => updateFilter("search", val), 400);
            return () => clearTimeout(timeout);
          }}
        />
      </div>

      {/* Platform filter */}
      <Select
        value={filters.platform}
        onValueChange={(v) => updateFilter("platform", v)}
      >
        <SelectTrigger className="w-[160px] border-slate-700 bg-slate-800/60 text-sm text-slate-200">
          <SlidersHorizontal className="mr-2 h-3.5 w-3.5 text-slate-500" />
          <SelectValue placeholder="Platform" />
        </SelectTrigger>
        <SelectContent className="border-slate-700 bg-slate-900">
          {PLATFORMS.map((p) => (
            <SelectItem
              key={p.value}
              value={p.value}
              className="text-sm text-slate-200"
            >
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select
        value={filters.status}
        onValueChange={(v) => updateFilter("status", v)}
      >
        <SelectTrigger className="w-[200px] border-slate-700 bg-slate-800/60 text-sm text-slate-200">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="border-slate-700 bg-slate-900">
          {STATUSES.map((s) => (
            <SelectItem
              key={s.value}
              value={s.value}
              className="text-sm text-slate-200"
            >
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="h-9 gap-1.5 text-slate-400 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}

      {isPending && (
        <Badge variant="outline" className="border-slate-600 text-slate-400">
          Filtering…
        </Badge>
      )}
    </div>
  );
}
