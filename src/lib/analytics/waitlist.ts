"use client";
import { usePostHog } from "posthog-js/react";
import { isWaitlistMode } from "@/lib/feature-flags";
import config from "@/config";

export interface WaitlistAnalyticsParams {
  email: string;
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
  userAgent?: string;
}

export interface WaitlistEventProperties {
  email_domain?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
  user_agent?: string;
  waitlist_mode: boolean;
  timestamp: string;
  page_url?: string;
}

// Hook for client-side analytics
export function useWaitlistAnalytics() {
  const posthog = usePostHog();

  // Safely get search params only on client side
  const getSearchParams = () => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  };

  const trackWaitlistEvent = (
    eventName: string,
    params: WaitlistAnalyticsParams
  ) => {
    // Only track if PostHog is enabled and we're in waitlist mode
    if (!config.analytics.posthog.enabled || !isWaitlistMode()) {
      return;
    }

    // Extract UTM parameters from search params
    const searchParams = getSearchParams();
    const utmSource = searchParams.get("utm_source") || params.source;
    const utmMedium = searchParams.get("utm_medium") || params.medium;
    const utmCampaign = searchParams.get("utm_campaign") || params.campaign;
    const referrer = document.referrer || params.referrer;

    // Extract email domain for analysis
    const emailDomain = params.email.split("@")[1];

    const properties: WaitlistEventProperties = {
      email_domain: emailDomain,
      source: utmSource || "direct",
      medium: utmMedium || "none",
      campaign: utmCampaign || "none",
      referrer: referrer || "none",
      user_agent: navigator.userAgent,
      waitlist_mode: isWaitlistMode(),
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
    };

    // Track the event
    posthog.capture(eventName, properties);

    // Also identify the user for better tracking
    posthog.identify(params.email, {
      email: params.email,
      email_domain: emailDomain,
      first_seen: new Date().toISOString(),
    });
  };

  const trackWaitlistSignup = (params: WaitlistAnalyticsParams) => {
    trackWaitlistEvent("waitlist_signup", params);
  };

  const trackWaitlistFormView = () => {
    if (!config.analytics.posthog.enabled || !isWaitlistMode()) {
      return;
    }

    const searchParams = getSearchParams();
    const utmSource = searchParams.get("utm_source");
    const utmMedium = searchParams.get("utm_medium");
    const utmCampaign = searchParams.get("utm_campaign");

    posthog.capture("waitlist_form_viewed", {
      source: utmSource || "direct",
      medium: utmMedium || "none",
      campaign: utmCampaign || "none",
      referrer: document.referrer || "none",
      waitlist_mode: isWaitlistMode(),
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
    });
  };

  const trackWaitlistCTAClick = (ctaLocation: string) => {
    if (!config.analytics.posthog.enabled || !isWaitlistMode()) {
      return;
    }

    posthog.capture("waitlist_cta_clicked", {
      cta_location: ctaLocation,
      waitlist_mode: isWaitlistMode(),
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
    });
  };

  return {
    trackWaitlistSignup,
    trackWaitlistFormView,
    trackWaitlistCTAClick,
  };
}
