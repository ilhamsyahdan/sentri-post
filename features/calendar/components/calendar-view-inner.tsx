"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventContentArg } from "@fullcalendar/core";
import { memo } from "react";
import Image from "next/image";

import { useCalendar } from "../hooks/use-calendar";
import { CalendarEvent } from "../actions/get-calendar-posts";

import "../styles/calendar.css";

const STATUS_LABELS = {
  queued: "Queued",
  publishing: "Publishing",
  published: "Published",
  failed: "Failed",
} as const;

type PostStatus = keyof typeof STATUS_LABELS;

const EventContent = memo(function EventContent({
  eventInfo,
}: {
  eventInfo: EventContentArg;
}) {
  const platform = eventInfo.event.extendedProps.platform;
  const rawStatus = eventInfo.event.extendedProps.status;

  const status: PostStatus = rawStatus in STATUS_LABELS ? rawStatus : "queued";

  const statusText = STATUS_LABELS[status];

  return (
    <div className="calendar-event-content">
      {/* Platform + Time */}
      <div className="calendar-event-header">
        <Image
          src={platform ? `/${platform}.png` : "/default.png"}
          alt={platform ?? "platform"}
          width={13}
          height={13}
          className="calendar-event-platform-icon"
          loading="lazy"
        />

        <span className="calendar-event-time">{eventInfo.timeText}</span>
      </div>

      {/* Caption */}
      <div className="calendar-event-title">{eventInfo.event.title}</div>

      {/* Status */}
      <div className="calendar-event-status">{statusText}</div>
    </div>
  );
});

const renderEventContent = (info: EventContentArg) => (
  <EventContent eventInfo={info} />
);

interface CalendarViewProps {
  initialEvents: CalendarEvent[];
}

export default function CalendarViewInner({
  initialEvents,
}: CalendarViewProps) {
  const { events, handleEventDrop } = useCalendar(initialEvents);

  return (
    <div className="calendar-wrapper">
      <div className="calendar-legend">
        <span className="calendar-drag-hint">Drag to reschedule</span>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        timeZone="local"
        editable
        events={events}
        eventDrop={handleEventDrop}
        eventContent={renderEventContent}
        slotEventOverlap={false}
        defaultTimedEventDuration="00:20:00"
        eventMinHeight={60}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridWeek,dayGridMonth",
        }}
        buttonText={{
          today: "Today",
          timeGridWeek: "Week",
          dayGridMonth: "Month",
        }}
        buttonHints={{
          prev: "Previous $0",
          next: "Next $0",
          today: "This $0",
          timeGridWeek: "Week view",
          dayGridMonth: "Month view",
        }}
        allDaySlot={false}
        slotMinTime="06:00:00"
        slotMaxTime="23:00:00"
        height="auto"
        dayHeaderFormat={{
          weekday: "short",
          day: "numeric",
        }}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
      />
    </div>
  );
}
