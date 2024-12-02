import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TRPCReactProvider } from "@/trpc/react";
import { type PropsWithChildren } from "react";
import { LayoutContent } from "@/components/layout-content";
import { Toaster } from "@/components/ui/toaster";
import { HydrateClient } from "@/trpc/server";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { env } from "@/env";

export const metadata: Metadata = {
  title: env.NEXT_PUBLIC_BRAND.toUpperCase(),
  description: `${env.NEXT_PUBLIC_BRAND.toUpperCase()} is a video sharing platform`,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <HydrateClient>
            <NuqsAdapter>
              <LayoutContent>{children}</LayoutContent>
            </NuqsAdapter>
            <ReactQueryDevtools initialIsOpen={false} />
          </HydrateClient>
        </TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  );
}
