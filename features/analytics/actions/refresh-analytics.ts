// features/analytics/actions/refresh-analytics.ts
"use server";

import { inngest } from "@/inngest/client";

export async function refreshAnalytics(posts: { targetId: string }[]) {
  await Promise.all(
    posts.map((post) =>
      inngest.send({
        name: "post/analytics.sync",
        data: {
          targetId: post.targetId,
          attempt: 99,
        },
      })
    )
  );
}
