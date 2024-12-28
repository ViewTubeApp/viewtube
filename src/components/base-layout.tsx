import { type Locale } from "@/i18n/routing";
import "@/styles/globals.css";
import { TRPCReactProvider } from "@/trpc/react";
import { HydrateClient } from "@/trpc/server";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GeistSans } from "geist/font/sans";
import { MotionConfig } from "motion/react";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import Head from "next/head";
import { cookies } from "next/headers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type PropsWithChildren } from "react";

import { MOTION_DURATION } from "@/constants/motion";

import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

interface BaseLayoutProps extends PropsWithChildren {
  brand: string;
  locale: Locale;
}

export async function BaseLayout({ children, locale, brand }: BaseLayoutProps) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${GeistSans.variable}`}>
      <Head>
        <meta name="apple-mobile-web-app-title" content={brand} />
      </Head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <SessionProvider>
            <TRPCReactProvider>
              <HydrateClient>
                <NuqsAdapter>
                  <MotionConfig reducedMotion="user" transition={{ duration: MOTION_DURATION }}>
                    <SidebarProvider defaultOpen={defaultOpen}>
                      <AppSidebar collapsible="icon" />
                      <main className="w-full flex flex-col">
                        <Header />
                        <div className="relative p-2 sm:p-4 flex-1">{children}</div>
                      </main>
                    </SidebarProvider>
                  </MotionConfig>
                </NuqsAdapter>
                <ReactQueryDevtools initialIsOpen={false} />
              </HydrateClient>
            </TRPCReactProvider>
          </SessionProvider>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
