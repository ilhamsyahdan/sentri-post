"use client";

import { useState, useCallback } from "react";
import { EventDropArg } from "@fullcalendar/core";
import { toast } from "sonner";
import { CalendarEvent } from "../actions/get-calendar-posts";
import { reschedulePost } from "../actions/reschedule-post";

export function useCalendar(initialEvents: CalendarEvent[]) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);

  const handleEventDrop = useCallback(async (info: EventDropArg) => {
    const targetId = info.event.id;
    const newStart = info.event.start?.toISOString() ?? "";

    // Optimistic update
    setEvents((prev) =>
      prev.map((e) => (e.id === targetId ? { ...e, start: newStart } : e))
    );

    const result = await reschedulePost(targetId, newStart);

    if (!result.success) {
      // Rollback
      info.revert();
      setEvents((prev) =>
        prev.map((e) =>
          e.id === targetId ? { ...e, start: info.oldEvent.startStr } : e
        )
      );
      toast.error(result.error);
    } else {
      toast.success("Jadwal diperbarui.");
    }
  }, []);

  return {
    events,
    handleEventDrop,
  };
}
