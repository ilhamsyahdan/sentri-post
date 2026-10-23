import { getAnalyticsPosts } from "@/features/analytics/actions/get-analytics";
import AnalyticsClient from "@/features/analytics/components/analytics-client";

export default async function Page() {
  const posts = await getAnalyticsPosts();
  return <AnalyticsClient initialPosts={posts} />;
}
