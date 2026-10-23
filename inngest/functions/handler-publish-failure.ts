// inngest/functions/handle-publish-failure.ts
import { inngest } from "@/inngest/client";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export const handlePublishFailure = inngest.createFunction(
  {
    id: "handle-publish-failure",
    triggers: {
      event: "inngest/function.failed",
    },
  },
  async ({ event, step }) => {
    const data = event.data as {
      error: { message: string };
      event: {
        name: string;
        data: { postId: string; userId: string };
      };
    };

    if (data.event.name !== "post/publish.scheduled") return;

    const { postId } = data.event.data;

    await step.run("mark-failed", async () => {
      await getSupabase()
        .from("posts")
        .update({
          status: "failed",
          error_log: data.error.message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId);
    });
  }
);
