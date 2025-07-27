"use client";

import * as OriginalSentry from "@sentry/nextjs";
import config from "@/config";

// Determine if Sentry is enabled from config
const isSentryEnabled = config.monitoring.sentry.enabled;

// Create a safe wrapper for Sentry that won't break when disabled
export const Sentry = {
  // Capture exceptions safely
  captureException: (error: any, options?: any) => {
    if (isSentryEnabled) {
      return OriginalSentry.captureException(error, options);
    }

    // Log to console when Sentry is disabled to aid debugging
    console.error("Sentry disabled, logging locally:", error);
    return null;
  },

  // Capture messages safely
  captureMessage: (message: string, level?: any) => {
    if (isSentryEnabled) {
      return OriginalSentry.captureMessage(message, level);
    }
    console.log(`Sentry disabled, logging locally: ${message}`);
    return null;
  },

  // Span creation
  startSpan: async (spanContext: any, callback: () => Promise<any>) => {
    if (isSentryEnabled) {
      return OriginalSentry.startSpan(spanContext, callback);
    }

    // Just run the callback without Sentry instrumentation
    try {
      return await callback();
    } catch (error) {
      console.error("Sentry disabled, logging error from span:", error);
      throw error;
    }
  },

  // Allow access to other Sentry methods if needed
  ...(() => {
    if (isSentryEnabled) {
      return OriginalSentry;
    }

    // Return no-op functions for other Sentry methods
    return new Proxy(
      {},
      {
        get: (target, prop) => {
          if (prop in target) {
            return (target as any)[prop];
          }

          // Return a function that does nothing for any missing method
          return (...args: any[]) => {
            console.log(
              `Sentry is disabled. Method "${String(prop)}" not executed.`
            );
            return null;
          };
        },
      }
    );
  })(),
};
