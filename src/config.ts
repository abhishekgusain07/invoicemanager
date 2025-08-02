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

export default config;
