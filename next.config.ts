import {withSentryConfig} from "@sentry/nextjs";
import type { NextConfig } from "next";
import config from "./src/config";

const nextConfig: NextConfig = {
  eslint:{
    ignoreDuringBuilds: true
  },
  /* config options here */
  async rewrites() {
    // Only set up PostHog rewrites if enabled
    if (config.analytics.posthog.enabled) {
      return [
        {
          source: "/ingest/static/:path*",
          destination: "https://us-assets.i.posthog.com/static/:path*",
        },
        {
          source: "/ingest/:path*",
          destination: "https://us.i.posthog.com/:path*",
        },
        {
          source: "/ingest/decide",
          destination: "https://us.i.posthog.com/decide",
        },
      ];
    }
    return [];
  },
  // This is required to support PostHog trailing slash API requests - only needed if PostHog is enabled
  skipTrailingSlashRedirect: config.analytics.posthog.enabled,
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG || "buildingfullthrotle",
  project: process.env.SENTRY_PROJECT || "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true,
};

// Only apply Sentry configuration if enabled
const finalConfig = config.monitoring.sentry.enabled 
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;

export default finalConfig;