"use client";

import { env } from "@/env";
import { usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { usePostHog } from "posthog-js/react";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { Suspense, useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Skip PostHog initialization in development
    if (env.NEXT_PUBLIC_NODE_ENV === "development") {
      return;
    }

    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: "/api/ingest",
      person_profiles: "always",
      ui_host: env.NEXT_PUBLIC_POSTHOG_HOST,

      capture_heatmaps: true,
      capture_pageleave: true,
      capture_pageview: false,
      capture_exceptions: true,
      capture_performance: true,
      capture_dead_clicks: true,
    });
  }, []);

  // Skip PostHogProvider in development
  if (env.NEXT_PUBLIC_NODE_ENV === "development") {
    return children;
  }

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

  // Track pageviews
  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + "?" + searchParams.toString();
      }

      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}

// Wrap PostHogPageView in Suspense to avoid the useSearchParams usage above
// from de-opting the whole app into client-side rendering
// See: https://nextjs.org/docs/messages/deopted-into-client-rendering
function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}
