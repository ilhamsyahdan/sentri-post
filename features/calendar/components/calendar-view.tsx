"use client";

import dynamic from "next/dynamic";
import { CalendarEvent } from "../actions/get-calendar-posts";
import { Skeleton } from "@/components/ui/skeleton";

const CalendarViewInner = dynamic(() => import("./calendar-view-inner"), {
  ssr: false,
  loading: () => <Skeleton />,
});

export default function CalendarView({
  initialEvents,
}: {
  initialEvents: CalendarEvent[];
}) {
  return <CalendarViewInner initialEvents={initialEvents} />;
}
