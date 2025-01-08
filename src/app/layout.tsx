import * as m from "@/paraglide/messages";
import "@/styles/globals.css";
import { type Metadata } from "next";
import { type PropsWithChildren } from "react";

import { BaseLayout } from "@/components/base-layout";

export function generateMetadata() {
  const title = `${m.title_part_start()}${m.title_part_end()}`;

  return {
    title: {
      template: `%s | ${title}`,
      default: `${m.layout_description()} | ${title}`,
    },
    description: m.layout_description(),
    icons: [{ rel: "icon", url: "/favicon.ico" }],
  } satisfies Metadata;
}

export default async function RootLayout({ children }: PropsWithChildren) {
  const title = `${m.title_part_start()}${m.title_part_end()}`;
  return <BaseLayout brand={title}>{children}</BaseLayout>;
}
