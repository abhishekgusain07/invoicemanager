import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  // Handle legacy /login route redirect
  if (request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // First check if we're on auth pages
  if (
    request.nextUrl.pathname === "/sign-in" ||
    request.nextUrl.pathname === "/sign-up"
  ) {
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
  matcher: ["/dashboard", "/sign-up", "/sign-in", "/login"],
};
