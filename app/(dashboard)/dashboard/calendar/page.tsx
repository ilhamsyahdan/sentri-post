import { getCalendarPosts } from "@/features/calendar/actions/get-calendar-posts";
import CalendarView from "@/features/calendar/components/calendar-view";

export const metadata = {
  title: "Calendar Dashboard",
  description: "Manage and schedule your social media posts",
};

export default async function CalendarPage() {
  const events = await getCalendarPosts();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Calendar</h1>
      <CalendarView initialEvents={events} />
    </div>
  );
}
