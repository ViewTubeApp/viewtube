import { languageTag } from "@/paraglide/runtime";
import "@/styles/globals.css";
import { TRPCReactProvider } from "@/trpc/react";
import { HydrateClient } from "@/trpc/server";
import { LanguageProvider } from "@inlang/paraglide-next";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MotionConfig } from "motion/react";
import { SessionProvider } from "next-auth/react";
import { Commissioner } from "next/font/google";
import Head from "next/head";
import { cookies } from "next/headers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

import { MOTION_DURATION } from "@/constants/motion";

import { AppSidebar } from "@/components/app-sidebar";
import { ConsoleArt } from "@/components/console-art";
import { Header } from "@/components/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

import { ThemeProvider } from "./theme-provider";

const font = Commissioner({
  preload: true,
  display: "swap",
  variable: "--font-text",
  subsets: ["latin", "cyrillic"],
});

interface BaseLayoutProps extends PropsWithChildren {
  brand: string;
}

export async function BaseLayout({ children, brand }: BaseLayoutProps) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <LanguageProvider>
      <SessionProvider>
        <TRPCReactProvider>
          <HydrateClient>
            <NuqsAdapter>
              <MotionConfig reducedMotion="user" transition={{ duration: MOTION_DURATION }}>
                <SidebarProvider defaultOpen={defaultOpen}>
                  <html lang={languageTag()} className={font.className} suppressHydrationWarning>
                    <Head>
                      <meta name="apple-mobile-web-app-title" content={brand} />
                    </Head>
                    <body>
                      <ThemeProvider attribute="class" defaultTheme="dark">
                        <ConsoleArt />
                        <AppSidebar collapsible="icon" />
                        <main className="w-full flex flex-col">
                          <Header />
                          <div className="relative p-2 sm:p-4 flex-1">{children}</div>
                        </main>
                        <Toaster />
                      </ThemeProvider>
                    </body>
                  </html>
                </SidebarProvider>
              </MotionConfig>
            </NuqsAdapter>
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
          </HydrateClient>
        </TRPCReactProvider>
      </SessionProvider>
    </LanguageProvider>
  );
}
