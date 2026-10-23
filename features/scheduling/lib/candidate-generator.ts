import { Candidate, SchedulingSlot } from "../types/scheduling.types";
import { DEFAULT_TIMEZONE } from "../constants/scheduling.constants";
import { fromZonedTime } from "date-fns-tz";
import { formateDateOnly, getZonedDay, zonedNow } from "@/lib/timezone";

export function generateCandidates(
  slots: SchedulingSlot[],
  daysAhead: number
): Candidate[] {
  const now = new Date();
  const candidates: Candidate[] = [];

  for (const slot of slots) {
    const timezone = slot.timezone ?? DEFAULT_TIMEZONE;

    for (let i = 0; i < daysAhead; i++) {
      const candidateDate = buildCandidateDate(slot, timezone, i);
      if (!candidateDate) continue;
      if (candidateDate.getTime() <= now.getTime()) continue;

      candidates.push({
        scheduledAt: candidateDate,
        timezone,
        day_of_week: slot.day_of_week,
        time_slot: slot.time_slot,
        platform: slot.connections?.platform ?? "instagram",
      });
    }
  }

  return candidates;
}

function buildCandidateDate(
  slot: SchedulingSlot,
  timezone: string,
  daysOffset: number
): Date | null {
  const base = zonedNow(timezone);
  base.setDate(base.getDate() + daysOffset);

  const localDay = getZonedDay(base, timezone);
  if (localDay !== slot.day_of_week) return null;

  const dateStr = formateDateOnly(base, timezone);
  return fromZonedTime(`${dateStr} ${slot.time_slot.slice(0, 5)}`, timezone);
}
