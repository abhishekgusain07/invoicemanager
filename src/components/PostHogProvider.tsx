"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import config from "@/config";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const isEnabled = config.analytics.posthog.enabled;

  useEffect(() => {
    // Only initialize PostHog if it's enabled
    if (isEnabled) {
      posthog.init(
        config.analytics.posthog.apiKey || process.env.NEXT_PUBLIC_POSTHOG_KEY!,
        {
          api_host: "/ingest",
          ui_host: "https://us.posthog.com",
          capture_pageview: false, // We capture pageviews manually
          capture_pageleave: true, // Enable pageleave capture
        }
      );
    }
  }, [isEnabled]);

  // If PostHog is disabled, just render children without the provider
  if (!isEnabled) {
    return <>{children}</>;
  }

  // If PostHog is enabled, wrap children with the provider
  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  );
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();
  const isEnabled = config.analytics.posthog.enabled;

  useEffect(() => {
    if (pathname && posthog && isEnabled) {
      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) {
        url += "?" + search;
      }
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, posthog, isEnabled]);

  return null;
}

function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}
