// features/admin/failed-jobs/components/FailedJobsClient.tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { FailedJobsTable } from "./failed-jobs-table";
import type { FailedJob } from "../types";

interface Props {
  jobs: FailedJob[];
  total: number;
  page: number;
  pageSize: number;
}

export function FailedJobsClient({ jobs, total, page, pageSize }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(newPage));
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <FailedJobsTable
      jobs={jobs}
      total={total}
      page={page}
      pageSize={pageSize}
      onPageChange={handlePageChange}
    />
  );
}
