import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TRPCReactProvider } from "@/trpc/react";
import { type PropsWithChildren } from "react";
import { LayoutContent } from "@/components/layout-content";
import { HydrateClient } from "@/trpc/server";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { env } from "@/env";
import { Toaster } from "@/components/ui/sonner";
import { MotionConfig } from "motion/react";

export const metadata: Metadata = {
  title: env.NEXT_PUBLIC_BRAND.toUpperCase(),
  description: `${env.NEXT_PUBLIC_BRAND.toUpperCase()} is a video sharing platform`,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
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
