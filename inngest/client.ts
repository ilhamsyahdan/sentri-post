// inngest/client.ts
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "social-scheduler",
  eventKey: process.env.INNGEST_EVENT_KEY, // 🔥 penting
  eventBaseUrl: "http://localhost:8288",
});
