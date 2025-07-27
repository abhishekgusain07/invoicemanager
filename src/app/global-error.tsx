"use client";

import { Sentry } from "@/utils/sentry";
import NextError from "next/error";
import { useEffect } from "react";
import config from "@/config";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    // Will safely handle both enabled and disabled states
    Sentry.captureException(error);

    // Log to console when Sentry is disabled
    if (!config.monitoring.sentry.enabled) {
      console.error("Global error (Sentry disabled):", error);
    }
  }, [error]);

  return (
    <html>
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
