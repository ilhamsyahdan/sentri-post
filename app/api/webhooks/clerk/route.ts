// app/api/webhooks/clerk/route.ts

import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";

import { supabaseAdmin } from "@/utils/supabase/admin";

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET");
  }

  const headerPayload = await headers();

  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(secret);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid signature", {
      status: 400,
    });
  }

  switch (evt.type) {
    case "user.created": {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      const { error } = await supabaseAdmin.from("users").insert({
        id,
        email: email_addresses[0].email_address,
        full_name: `${first_name || ""} ${last_name || ""}`.trim(),
        avatar_url: image_url,
        role: "user",
        is_banned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error(error);
        return new Response("Database Error", { status: 500 });
      }

      break;
    }

    case "user.updated": {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      const { error } = await supabaseAdmin
        .from("users")
        .update({
          email: email_addresses[0].email_address,
          full_name: `${first_name || ""} ${last_name || ""}`.trim(),
          avatar_url: image_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error(error);
        return new Response("Database Error", { status: 500 });
      }

      break;
    }

    case "user.deleted": {
      await supabaseAdmin.from("users").delete().eq("id", evt.data.id);
      break;
    }

    // ─── SECURITY EVENTS ────────────────────────────────────────────

    case "session.created": {
      const { user_id } = evt.data;

      await supabaseAdmin.from("security_events").insert({
        user_id,
        event_type: "login",
      });

      break;
    }

    case "session.revoked": {
      const { user_id } = evt.data;

      await supabaseAdmin.from("security_events").insert({
        user_id,
        event_type: "session_revoked",
      });

      break;
    }
  }

  return new Response("OK", { status: 200 });
}
