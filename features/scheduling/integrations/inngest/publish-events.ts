// @/features/scheduling/integrations/inngest/publish-events.ts

import { inngest } from "@/inngest/client";

interface TriggeredScheduledPostParams {
  postId: string;
  targetId: string;
  userId: string;
  scheduledAt: string;
}

export async function cancelScheduledPosts(targetIds: string[]) {
  await Promise.allSettled(
    targetIds.map((targetId) =>
      inngest.send({
        name: "post/publish.cancel",
        data: { targetId },
      })
    )
  );
}

export async function triggerScheduledPosts(targetIds: string[]) {
  await Promise.allSettled(
    targetIds.map((targetId) =>
      inngest.send({
        name: "post/publish.scheduled",
        data: { targetId },
      })
    )
  );
}

export async function triggerScheduledPost({
  postId,
  targetId,
  userId,
  scheduledAt,
}: TriggeredScheduledPostParams) {
  return inngest.send({
    name: "post/publish.scheduled",
    data: {
      postId,
      targetId,
      userId,
      scheduledAt,
    },
  });
}
