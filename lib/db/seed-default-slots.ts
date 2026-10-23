import { supabaseAdmin } from "@/utils/supabase/admin";
import { RESEARCH_BASE } from "@/features/scheduling/lib/slot-scorer";

function buildDefaultSlots(platform: string) {
  const research = RESEARCH_BASE[platform];
  if (!research) return [];

  return Object.entries(research).flatMap(([day, times]) =>
    times.map((time) => ({
      day: Number(day),
      time,
    }))
  );
}

export async function seedDefaultSlots(
  connectionId: string,
  platform: string,
  timezone: string = "Asia/Jakarta"
) {
  const slots = buildDefaultSlots(platform);

  if (slots.length === 0) {
    console.warn(
      `[seedDefaultSlots] Tidak ada data RESEARCH_BASE untuk platform: ${platform}`
    );
    return;
  }

  const { error } = await supabaseAdmin.from("scheduling_slots").upsert(
    slots.map((s) => ({
      connection_id: connectionId,
      day_of_week: s.day,
      time_slot: s.time,
      timezone,
      is_active: true,
    })),
    {
      onConflict: "connection_id, day_of_week, time_slot",
      ignoreDuplicates: true,
    }
  );

  if (error) {
    console.error(
      `[seedDefaultSlots] Gagal seed slots untuk ${platform}:`,
      error
    );
  }
}
