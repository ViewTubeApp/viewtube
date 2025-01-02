import { env } from "@/env";
import * as m from "@/paraglide/messages";
import "@/styles/globals.css";
import { type Metadata } from "next";
import { type PropsWithChildren } from "react";

import { BaseLayout } from "@/components/base-layout";

const brand = env.NEXT_PUBLIC_BRAND.toUpperCase();

export function generateMetadata() {
  return {
    title: {
      template: `%s | ${brand}`,
      default: `${m.layout_description()} | ${brand}`,
    },
    description: m.layout_description(),
    icons: [{ rel: "icon", url: "/favicon.ico" }],
  } satisfies Metadata;
}

export default async function RootLayout({ children }: PropsWithChildren) {
  return <BaseLayout brand={brand}>{children}</BaseLayout>;
}
