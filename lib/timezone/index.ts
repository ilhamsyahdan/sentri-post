import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { id } from "date-fns/locale";

export function formatIndonesianDate(
  date: Date | string,
  timezone: string = "Asia/Jakarta"
) {
  return formatInTimeZone(
    new Date(date),
    timezone,
    "d MMMM yyyy 'pukul' HH.mm",
    {
      locale: id,
    }
  );
}

export function zonedNow(timezone: string) {
  return toZonedTime(new Date(), timezone);
}

export function toUTC(localDate: Date | string, timezone: string) {
  return fromZonedTime(localDate, timezone);
}

export function getZonedDay(date: Date, timezone: string) {
  return Number(formatInTimeZone(date, timezone, "i")) % 7;
}

export function getZonedHour(date: Date, timezone: string) {
  return Number(formatInTimeZone(date, timezone, "HH"));
}

export function formatLocal(date: Date, timezone: string) {
  return formatInTimeZone(date, timezone, "yyyy-MM-dd'T'HH:mm");
}

export function formateDateOnly(date: Date, timezone: string) {
  return formatInTimeZone(date, timezone, "yyyy-MM-dd");
}
