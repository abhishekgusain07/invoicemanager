// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import config from "./src/config";

// Only initialize Sentry if it's enabled in config
if (config.monitoring.sentry.enabled) {
  Sentry.init({
    dsn: config.monitoring.sentry.dsn || process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Use config values or fall back to default values
    tracesSampleRate: config.monitoring.sentry.tracesSampleRate || 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  });
} else {
  console.log("Sentry monitoring is disabled for server-side.");
}
