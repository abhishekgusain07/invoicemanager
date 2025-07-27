"use server";
import { Sentry } from "@/utils/sentry";
import config from "@/config";

export const sentryErrorServerAction = async () => {
  try {
    throw new Error("testing error");
  } catch (error) {
    // Still works if Sentry is disabled - logs to console
    Sentry.captureException(error);

    if (config.monitoring.sentry.enabled) {
      console.log("Sentry error captured");
    } else {
      console.log("Sentry disabled, error logged to console only");
    }

    throw error;
  }
};
