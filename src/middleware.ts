import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const isWaitlistMode = process.env.NEXT_PUBLIC_WAITLIST_MODE === "true";
  const pathname = request.nextUrl.pathname;

  // Handle legacy /login route redirect
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // In waitlist mode, redirect auth pages to home
  if (isWaitlistMode) {
    if (pathname === "/sign-in" || pathname === "/sign-up") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Block dashboard and protected routes in waitlist mode
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/app")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Allow public pages in waitlist mode
    return NextResponse.next();
  }

  // Normal mode (full app) logic below
  // First check if we're on auth pages
  if (pathname === "/sign-in" || pathname === "/sign-up") {
    // If we have a session, redirect to home
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // If no session, allow access to auth pages
    return NextResponse.next();
  }

  // For protected routes (like dashboard)
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/sign-up",
    "/sign-in",
    "/login",
    "/dashboard/:path*",
    "/app/:path*",
  ],
};
