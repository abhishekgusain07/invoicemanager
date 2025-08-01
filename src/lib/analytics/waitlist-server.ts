import { isWaitlistMode } from "@/lib/feature-flags";
import config from "@/config";

export interface WaitlistAnalyticsParams {
  email: string;
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
  userAgent?: string;
}

export interface WaitlistEventProperties {
  email_domain?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
  user_agent?: string;
  waitlist_mode: boolean;
  timestamp: string;
}

// Server-side analytics function
export async function trackWaitlistSignupServer(params: WaitlistAnalyticsParams) {
  // Import PostHog client dynamically to avoid client-side issues
  const PostHogClient = (await import("@/lib/posthog")).default;
  const posthog = PostHogClient();

  if (!config.analytics.posthog.enabled || !isWaitlistMode()) {
    return;
  }

  const emailDomain = params.email.split("@")[1];

  const properties: WaitlistEventProperties = {
    email_domain: emailDomain,
    source: params.source || "direct",
    medium: params.medium || "none",
    campaign: params.campaign || "none",
    referrer: params.referrer || "none",
    user_agent: params.userAgent || "unknown",
    waitlist_mode: isWaitlistMode(),
    timestamp: new Date().toISOString(),
  };

  // Track server-side event
  posthog.capture({
    distinctId: params.email,
    event: "waitlist_signup_server",
    properties,
  });

  // Identify the user
  posthog.identify({
    distinctId: params.email,
    properties: {
      email: params.email,
      email_domain: emailDomain,
      first_seen: new Date().toISOString(),
    },
  });

  // Flush events to ensure they're sent
  await posthog.shutdown();
}