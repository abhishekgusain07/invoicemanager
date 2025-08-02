// Define config inline since we can't directly import TypeScript files in ESM
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

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["assets.aceternity.com"],
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
  // Only needed if PostHog is enabled
  skipTrailingSlashRedirect: config.analytics.posthog.enabled,
};

export default nextConfig;
