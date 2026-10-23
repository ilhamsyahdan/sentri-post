"use server";

import { SlotResult } from "@/features/post/components/schedule-step";
import { supabaseAdmin } from "@/utils/supabase/admin";
// SlotResult diambil dari tempat yang sama dengan ConfirmedSlot (tidak diubah),
// jadi hasil fetch di sini otomatis kompatibel dengan AltRow & onConfirm.

const LOOKAHEAD_DAYS = 30;
const MAX_DAYS_TO_SCAN = 35; // buffer kecil biar tiap hari-dalam-minggu pasti kebahas
const WIB = "Asia/Jakarta";

/**
 * Konversi wall-clock date/time di sebuah IANA timezone -> UTC Date.
 * Pure Intl, tidak butuh library tambahan (date-fns-tz/luxon/dll).
 */
function zonedWallTimeToUtc(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const asIfUtc = new Date(
    utcGuess.toLocaleString("en-US", { timeZone: "UTC" })
  );
  const asIfZoned = new Date(utcGuess.toLocaleString("en-US", { timeZone }));
  const offset = asIfZoned.getTime() - asIfUtc.getTime();
  return new Date(utcGuess.getTime() - offset);
}

function getZonedYMD(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return {
    year: Number(parts.find((p) => p.type === "year")?.value),
    month: Number(parts.find((p) => p.type === "month")?.value),
    day: Number(parts.find((p) => p.type === "day")?.value),
  };
}

/**
 * Representasi wall-clock WIB (parseable) dari sebuah instant UTC.
 * Dipakai sebagai `scheduledAtLocal`, karena schedule-post.service.ts
 * mem-parse field ini dengan `fromZonedTime(str, "Asia/Jakarta")`.
 * Formatnya "yyyy-MM-dd HH:mm:ss" agar valid diparse date-fns-tz,
 * TIDAK dipakai untuk ditampilkan ke user (display pakai formatShort di komponen).
 */
function toParseableWibWallClock(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: WIB,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "00";

  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get(
    "minute"
  )}:${get("second")}`;
}

/**
 * Cari occurrence berikutnya (setelah `now`) untuk sebuah (dayOfWeek, "HH:mm", timezone).
 * dayOfWeek: 0=Minggu .. 6=Sabtu (sama seperti Date.getUTCDay()).
 */
function getUpcomingOccurrence(
  dayOfWeek: number,
  timeSlot: string,
  timezone: string,
  now: Date
): Date | null {
  const [hour, minute] = timeSlot.split(":").map(Number);

  for (let i = 0; i < MAX_DAYS_TO_SCAN; i++) {
    const probe = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const { year, month, day } = getZonedYMD(probe, timezone);
    const dow = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

    if (dow !== dayOfWeek) continue;

    const candidateUtc = zonedWallTimeToUtc(
      year,
      month,
      day,
      hour,
      minute,
      timezone
    );
    if (candidateUtc.getTime() > now.getTime()) {
      return candidateUtc;
    }
  }
  return null;
}

/**
 * Ambil N slot posting terdekat untuk sebuah channel/connection, murni dari
 * tabel `scheduling_slots` (yang di-seed oleh `seedDefaultSlots` dari RESEARCH_BASE).
 * Tidak ada scoring/formula tambahan — cuma baca & konversi ke waktu terdekat.
 *
 * Standalone — TIDAK import/menyentuh action `getNextAvailableSlots` yang lama.
 *
 * Asumsi: `connectionId` === `channel.id` yang dipakai di UI.
 * Sesuaikan query di bawah kalau mapping di schema kamu berbeda.
 */
export async function getNextSlotsFromResearch(
  connectionId: string,
  limit: number = 4
): Promise<SlotResult[]> {
  const { data: slots, error } = await supabaseAdmin
    .from("scheduling_slots")
    .select("day_of_week, time_slot, timezone")
    .eq("connection_id", connectionId)
    .eq("is_active", true);

  if (error || !slots || slots.length === 0) {
    return [];
  }

  const now = new Date();
  const horizon = new Date(
    now.getTime() + LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000
  );

  const occurrences: Date[] = [];

  for (const slot of slots) {
    const occurrence = getUpcomingOccurrence(
      slot.day_of_week,
      slot.time_slot,
      slot.timezone,
      now
    );
    if (occurrence && occurrence <= horizon) {
      occurrences.push(occurrence);
    }
  }

  occurrences.sort((a, b) => a.getTime() - b.getTime());

  return occurrences.slice(0, limit).map((utc) => ({
    scheduledAtLocal: toParseableWibWallClock(utc),
    scheduledAtUTC: utc.toISOString(),
    skippedSlots: [], // tidak ada conflict-check, murni dari RESEARCH_BASE
  }));
}
