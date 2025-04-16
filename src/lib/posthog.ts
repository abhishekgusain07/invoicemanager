import { PostHog } from "posthog-node"
import config from "@/config"

export default function PostHogClient() {
  // Return a no-op client if PostHog is disabled
  if (!config.analytics.posthog.enabled) {
    return {
      capture: () => {},
      identify: () => {},
      groupIdentify: () => {},
      isFeatureEnabled: () => false,
      getFeatureFlag: () => null,
      shutdown: () => Promise.resolve(),
    } as unknown as PostHog;
  }
  
  // Initialize real client if enabled
  const posthogClient = new PostHog(
    config.analytics.posthog.apiKey || process.env.NEXT_PUBLIC_POSTHOG_KEY!, 
    {
      host: config.analytics.posthog.apiHost || "https://us.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    }
  )
  return posthogClient
}
