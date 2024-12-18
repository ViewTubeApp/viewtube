import { env } from "@/env";
import "@/styles/globals.css";
import { TRPCReactProvider } from "@/trpc/react";
import { HydrateClient } from "@/trpc/server";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GeistSans } from "geist/font/sans";
import { MotionConfig } from "motion/react";
import { type Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { cookies } from "next/headers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type PropsWithChildren } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: env.NEXT_PUBLIC_BRAND.toUpperCase(),
  description: `${env.NEXT_PUBLIC_BRAND.toUpperCase()} is a video sharing platform`,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-title" content={env.NEXT_PUBLIC_BRAND} />
      </head>
      <body>
        <SessionProvider>
          <TRPCReactProvider>
            <HydrateClient>
              <NuqsAdapter>
                <MotionConfig transition={{ duration: 0.2 }}>
                  <SidebarProvider defaultOpen={defaultOpen}>
                    <AppSidebar collapsible="icon" />
                    <main className="w-full flex flex-col">
                      <Header />
                      <div className="p-4 flex-1">{children}</div>
                    </main>
                  </SidebarProvider>
                </MotionConfig>
              </NuqsAdapter>
              <ReactQueryDevtools initialIsOpen={false} />
            </HydrateClient>
          </TRPCReactProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
