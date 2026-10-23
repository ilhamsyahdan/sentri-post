import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getPlatformClient, SUPPORTED_PLATFORMS } from "@/lib/platforms";
import type { SupportedPlatform } from "@/lib/platforms";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { userId } = await auth();
  const { platform } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (!userId) {
    return NextResponse.redirect(`${baseUrl}/sign-in`);
  }

  if (!SUPPORTED_PLATFORMS.includes(platform as SupportedPlatform)) {
    return NextResponse.json(
      { error: "Platform not supported" },
      { status: 400 }
    );
  }

  const client = getPlatformClient(platform); // ← was params.platform
  const authUrl = client.getAuthUrl(userId);

  return NextResponse.redirect(authUrl);
}
