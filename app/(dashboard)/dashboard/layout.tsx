import { getMyChannels } from "@/features/channel/actions/get-channels";
import { formatHandle } from "@/features/channel/utils/format-handle";
import { getPlatformColor } from "@/features/channel/utils/platform-color";
import DashboardShell from "@/features/dashboard/dashboard-shell";
import { PostModalProvider } from "@/features/post/context/post-modal-context";
import { auth } from "@clerk/nextjs/server";

interface SupabaseConnection {
  idx: number;
  id: string;
  user_id: string;
  platform: string;
  platform_user_id: string;
  platform_user_name: string; // <--- Ini kolom aslinya
  avatar_url: string; // <--- Ini kolom aslinya
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string;
  created_at: string;
  updated_at: string;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth();
  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  const isAdmin = role === "admin";

  const data = await getMyChannels();
  const channels = data.map((row: SupabaseConnection) => ({
    id: row.id,
    name: row.platform_user_name,
    handle: formatHandle(row),
    platform: row.platform,
    avatar: row.avatar_url,
    color: getPlatformColor(row.platform),
  }));

  return (
    <PostModalProvider>
      <DashboardShell channels={channels} isAdmin={isAdmin}>
        {children}
      </DashboardShell>
    </PostModalProvider>
  );
}
