// app/(dashboard)/dashboard/publish/page.tsx
import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getPosts } from "@/features/post/actions/get-posts";
import { mapToPost } from "@/features/post/utils/map-to-post";
import PublishClient from "./publish-client";

// ── Metadata ───────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Publish | Sentriposts",
  description: "Manage & schedule posts across all channels",
};

export default async function PublishPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const rows = await getPosts();
  const initialPosts = rows.map(mapToPost);

  return <PublishClient initialPosts={initialPosts} />;
}
