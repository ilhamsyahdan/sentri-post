import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const pathname = req.nextUrl.pathname;

  const userMetadata =
    (sessionClaims?.metadata as { role?: string; is_banned?: boolean }) ?? {};
  const role = userMetadata.role;
  const isBanned = userMetadata.is_banned ?? false;

  if (userId) {
    if (isBanned && pathname !== "/banned") {
      return NextResponse.redirect(new URL("/banned", req.url));
    }
    if (!isBanned && pathname === "/banned") {
      return NextResponse.redirect(new URL("/dashboard/publish", req.url));
    }
  }

  // admin route
  if (isAdminRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard/publish", req.url));
    }
  }

  // =========================
  // PROTECTED ROUTE
  // =========================
  if (!userId && isProtectedRoute(req)) {
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    const url = new URL("/dashboard/publish", req.url);
    url.search = req.nextUrl.search;
    return NextResponse.redirect(url);
  }

  // =========================
  // SIGN-IN REDIRECT
  // =========================
  if (!userId && pathname === "/sign-in") {
    const redirectUrl = req.nextUrl.searchParams.get("redirect_url");
    if (!redirectUrl) {
      const url = new URL("/sign-in", req.url);
      url.searchParams.set("redirect_url", "/dashboard/publish");
      return NextResponse.redirect(url);
    }
  }

  // =========================
  // USER SUDAH LOGIN
  // =========================
  if (userId && pathname === "/sign-in") {
    return NextResponse.redirect(
      new URL(role === "admin" ? "/admin" : "/dashboard/publish", req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
