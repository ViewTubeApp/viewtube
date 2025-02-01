import * as m from "@/paraglide/messages";
import { type Metadata } from "next";

import { ModelsHeader } from "./header";
import { ModelsTable } from "./table";

export async function generateMetadata() {
  return { title: m.models() } satisfies Metadata;
}

export default async function ModelsPage() {
  return (
    <div className="lg:container lg:mx-auto">
      <ModelsHeader />
      <ModelsTable />
    </div>
  );
}
