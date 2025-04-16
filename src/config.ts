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
        apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      },
    },
    monitoring: {
      sentry: {
        enabled: process.env.NEXT_PUBLIC_SENTRY_DSN ? true : false,
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        // Optional configuration
        tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
        profilesSampleRate: 1.0, // Capture 100% of profiles for performance monitoring
      },
    },
  };
  
  export default config;