import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { waitlist } from "@/db/schema";
import { isWaitlistMode } from "@/lib/feature-flags";
import config from "@/config";

export async function GET() {
  const checks: any = {
    timestamp: new Date().toISOString(),
    status: "healthy",
    checks: {
      database: { status: "unknown", latency: 0 },
      waitlistMode: { status: "unknown", enabled: false },
      analytics: { status: "unknown", enabled: false },
      email: { status: "unknown", configured: false },
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      waitlistMode: isWaitlistMode(),
    },
  };

  // Check database connectivity
  try {
    const start = Date.now();
    await db.$count(waitlist);
    const latency = Date.now() - start;
    
    checks.checks.database = {
      status: "healthy",
      latency,
    };
  } catch (error) {
    checks.checks.database = {
      status: "unhealthy",
      latency: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
    checks.status = "unhealthy";
  }

  // Check waitlist mode configuration
  try {
    const waitlistEnabled = isWaitlistMode();
    checks.checks.waitlistMode = {
      status: "healthy",
      enabled: waitlistEnabled,
    };
  } catch (error) {
    checks.checks.waitlistMode = {
      status: "unhealthy",
      enabled: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Check analytics configuration
  try {
    const analyticsEnabled = config.analytics.posthog.enabled;
    checks.checks.analytics = {
      status: analyticsEnabled ? "healthy" : "disabled",
      enabled: analyticsEnabled,
      configured: !!config.analytics.posthog.apiKey,
    };
  } catch (error) {
    checks.checks.analytics = {
      status: "unhealthy",
      enabled: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Check email configuration
  try {
    const emailConfigured = !!process.env.RESEND_API_KEY;
    checks.checks.email = {
      status: emailConfigured ? "healthy" : "disabled",
      configured: emailConfigured,
    };
  } catch (error) {
    checks.checks.email = {
      status: "unhealthy",
      configured: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Return appropriate status code
  const statusCode = checks.status === "healthy" ? 200 : 503;

  return NextResponse.json(checks, { status: statusCode });
}