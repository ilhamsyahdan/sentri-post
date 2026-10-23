import { supabaseAdmin } from "@/utils/supabase/admin";

type SchedulingSlot = {
  id: string;
  connection_id: string;
  day_of_week: number;
  time_slot: string;
  timezone: string | null;
  connections?: {
    platform?: string;
  } | null;
};

export async function fetchSlots(connectionIds: string[]) {
  const { data } = await supabaseAdmin
    .from("scheduling_slots")
    .select(
      `
      id,
      connection_id,
      day_of_week,
      time_slot,
      timezone,
      connections (
        platform
      )
    `
    )
    .in("connection_id", connectionIds)
    .eq("is_active", true);

  return (data ?? []) as SchedulingSlot[];
}

export async function fetchExistingTargets(connectionIds: string[], now: Date) {
  const { data } = await supabaseAdmin
    .from("post_targets")
    .select("scheduled_at")
    .in("connection_id", connectionIds)
    .in("status", ["queued", "publishing"])
    .gte("scheduled_at", now.toISOString());

  return data ?? [];
}

export async function fetchHistoryTargets(connectionIds: string[]) {
  const { data } = await supabaseAdmin
    .from("post_targets")
    .select(
      `
      scheduled_at,
      status,
      engagement_rate,
      views_count,
      connection_id
    `
    )
    .in("connection_id", connectionIds)
    .in("status", ["published", "failed", "failed_permanent"]);

  return data ?? [];
}
