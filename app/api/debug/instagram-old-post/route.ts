import { NextResponse } from "next/server";
import { debugOldInstagramPost } from "@/lib/debug/debug-old-instagram-post";

export async function GET() {
  try {
    const result = await debugOldInstagramPost();

    return NextResponse.json(result);
  } catch (error) {
    console.error("[DEBUG OLD INSTAGRAM POST] RAW ERROR:", error);

    return NextResponse.json(
      {
        error: String(error),
        errorDetails: error,
      },
      { status: 500 }
    );
  }
}
