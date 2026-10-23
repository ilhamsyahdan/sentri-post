import { supabaseAdmin } from "@/utils/supabase/admin";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AuthRedirectPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("role, is_banned")
    .eq("id", userId)
    .single();

  if (user?.is_banned) {
    redirect("/banned");
  }

  if (user?.role === "admin") {
    redirect("/admin");
  }

  redirect("/dashboard/publish");
}
