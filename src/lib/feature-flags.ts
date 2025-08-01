import { env } from "@/env";

/**
 * Feature flag utilities for controlling app behavior
 */

/**
 * Check if the app is in waitlist mode
 * @returns {boolean} True if app should show waitlist, false for full app
 */
export function isWaitlistMode(): boolean {
  return env.NEXT_PUBLIC_WAITLIST_MODE;
}

/**
 * Check if full app features should be available
 * @returns {boolean} True if full app features are available
 */
export function isFullAppMode(): boolean {
  return !env.NEXT_PUBLIC_WAITLIST_MODE;
}

/**
 * Feature flags object for easy access
 */
export const featureFlags = {
  waitlistMode: isWaitlistMode(),
  fullAppMode: isFullAppMode(),
} as const;
