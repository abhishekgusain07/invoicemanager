// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import config from "@/config";

// Only initialize Sentry if it's enabled in config
if (config.monitoring.sentry.enabled) {
  Sentry.init({
    dsn: config.monitoring.sentry.dsn || process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Add optional integrations for additional features
    integrations: [
      Sentry.replayIntegration(),
    ],

    // Use config values or fall back to default values
    tracesSampleRate: config.monitoring.sentry.tracesSampleRate || 1.0,

    // Define how likely Replay events are sampled.
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,

    // Define how likely Replay events are sampled when an error occurs.
    replaysOnErrorSampleRate: 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  });
} else {
  console.log('Sentry monitoring is disabled for client-side.');
}