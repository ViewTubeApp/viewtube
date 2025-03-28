import "@/styles/globals.css";
import { TRPCReactProvider } from "@/trpc/react";
import { HydrateClient } from "@/trpc/server";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MotionConfig } from "motion/react";
import { type Locale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Commissioner } from "next/font/google";
import Head from "next/head";
import { cookies } from "next/headers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type PropsWithChildren } from "react";
import { match } from "ts-pattern";

import { MOTION_DURATION } from "@/constants/motion";
import { SIDEBAR_COOKIE_NAME } from "@/constants/sidebar";

import { ConsoleArt } from "@/components/console-art";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

import { PostHogProvider } from "./posthog-provider";
import { ThemeProvider } from "./theme-provider";

const font = Commissioner({
  preload: true,
  display: "swap",
  variable: "--font-text",
  subsets: ["latin", "cyrillic"],
});

interface ProvidersProps extends PropsWithChildren {
  brand: string;
  locale: Locale;
}

export async function Providers({ children, brand, locale }: ProvidersProps) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value === "true";

  const messages = await getMessages();

  const localization = await match(locale)
    .with("ru", () => import("@clerk/localizations/ru-RU").then((m) => m.ruRU))
    .with("en", () => import("@clerk/localizations/en-US").then((m) => m.enUS))
    .exhaustive();

  return (
    <ClerkProvider appearance={{ baseTheme: dark }} localization={localization}>
      <TRPCReactProvider>
        <HydrateClient>
          <NuqsAdapter>
            <NextIntlClientProvider messages={messages}>
              <MotionConfig reducedMotion="user" transition={{ duration: MOTION_DURATION }}>
                <html lang={locale} className={font.className} suppressHydrationWarning>
                  <Head>
                    <meta name="apple-mobile-web-app-title" content={brand} />
                  </Head>
                  <body>
                    <PostHogProvider>
                      <SidebarProvider defaultOpen={defaultOpen}>
                        <ThemeProvider attribute="class" defaultTheme="dark">
                          <ConsoleArt />
                          {children}
                          <Toaster />
                          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
                        </ThemeProvider>
                      </SidebarProvider>
                    </PostHogProvider>
                  </body>
                </html>
              </MotionConfig>
            </NextIntlClientProvider>
          </NuqsAdapter>
        </HydrateClient>
      </TRPCReactProvider>
    </ClerkProvider>
  );
}
