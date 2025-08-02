/** @type {import('next').NextConfig} */

// Define config inline for Node.js compatibility
const config = {
  auth: {
    enabled: true,
  },
  payments: {
    enabled: true,
  },
  analytics: {
    posthog: {
      enabled: process.env.NEXT_PUBLIC_POSTHOG_KEY ? true : false,
      apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      apiHost:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
    },
  },
};

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
      },
    ],
  },
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
  // Only needed if PostHog is enabled
  skipTrailingSlashRedirect: config.analytics.posthog.enabled,
};

module.exports = nextConfig;
