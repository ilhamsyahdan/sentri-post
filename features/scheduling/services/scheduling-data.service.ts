// import {
//   fetchExistingTargets,
//   fetchHistoryTargets,
//   fetchSlots,
// } from "../repositories/scheduling.repository";

// export async function fetchSchedulingData(connectionIds: string[], now: Date) {
//   const in30Days = new Date(now);

//   in30Days.setDate(in30Days.getDate() + 30);

//   const [
//     slotsResponse,
//     holidaysResponse,
//     existingTargetsResponse,
//     historyTargetsResponse,
//   ] = await Promise.all([
//     fetchSlots(connectionIds),
//     fetchExistingTargets(connectionIds, now),
//     fetchHistoryTargets(connectionIds),
//   ]);

//   return {
//     slots: slotsResponse ?? [],
//     takenTimes: (existingTargetsResponse ?? []).map((t) =>
//       new Date(t.scheduled_at).getTime()
//     ),
//     historyTargets: historyTargetsResponse ?? [],
//   };
// }
