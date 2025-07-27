import { NextResponse } from "next/server";
import { Sentry } from "@/utils/sentry";
import config from "@/config";

export const dynamic = "force-dynamic";

// A faulty API route to test Sentry's error monitoring
export function GET() {
  const error = new Error("Sentry Example API Route Error");

  // Capture the error with our wrapper (will handle disabled state safely)
  Sentry.captureException(error);

  // Log info about whether Sentry is enabled
  if (config.monitoring.sentry.enabled) {
    console.error("API Error captured by Sentry");
  } else {
    console.error("API Error occurred (Sentry disabled):", error);
  }

  throw error;

  // Unreachable code, but included for completeness
  return NextResponse.json({ data: "Testing Sentry Error..." });
}
