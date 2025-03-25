"use client";

import { env } from "@/env";
import { usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { usePostHog } from "posthog-js/react";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { Suspense, useEffect } from "react";
import { match } from "ts-pattern";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: "/api/ingest",

      person_profiles: match<typeof env.NEXT_PUBLIC_NODE_ENV, "always" | "never" | "identified_only">(
        env.NEXT_PUBLIC_NODE_ENV,
      )
        .with("production", () => "always")
        .otherwise(() => "identified_only"),

      ui_host: env.NEXT_PUBLIC_POSTHOG_HOST,
      debug: env.NEXT_PUBLIC_NODE_ENV === "development",
      capture_pageview: false,
      capture_pageleave: env.NEXT_PUBLIC_NODE_ENV === "production",
      capture_performance: env.NEXT_PUBLIC_NODE_ENV === "production",
      capture_dead_clicks: env.NEXT_PUBLIC_NODE_ENV === "production",
      capture_exceptions: env.NEXT_PUBLIC_NODE_ENV === "production",
      capture_heatmaps: env.NEXT_PUBLIC_NODE_ENV === "production",
    });
  }, []);

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
