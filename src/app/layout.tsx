import { env } from "@/env";
import "@/styles/globals.css";
import { TRPCReactProvider } from "@/trpc/react";
import { HydrateClient } from "@/trpc/server";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GeistSans } from "geist/font/sans";
import { MotionConfig } from "motion/react";
import { type Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type PropsWithChildren } from "react";

import { LayoutContent } from "@/components/layout-content";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: env.NEXT_PUBLIC_BRAND.toUpperCase(),
  description: `${env.NEXT_PUBLIC_BRAND.toUpperCase()} is a video sharing platform`,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: PropsWithChildren) {
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
                <MotionConfig transition={{ duration: 0.3 }}>
                  <LayoutContent>{children}</LayoutContent>
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
