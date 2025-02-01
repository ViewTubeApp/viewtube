import * as m from "@/paraglide/messages";
import { type Metadata } from "next";
import { type PropsWithChildren } from "react";

import { ModelsHeader } from "./header";
import { ModelsTable } from "./table";

export async function generateMetadata() {
  return { title: m.models() } satisfies Metadata;
}

export default async function ModelsLayout({ children }: PropsWithChildren) {
  return (
    <div className="lg:container lg:mx-auto">
      <ModelsHeader />
      <ModelsTable />
      {children}
    </div>
  );
}
