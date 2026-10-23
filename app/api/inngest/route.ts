// src/app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { syncAnalytics } from "@/inngest/functions/sync-analytics";
import { publishPost } from "@/inngest/functions/publish-post";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [publishPost, syncAnalytics],
});
