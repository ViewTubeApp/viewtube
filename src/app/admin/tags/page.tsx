import * as m from "@/paraglide/messages";
import { type Metadata } from "next";

import { TagsHeader } from "./header";
import { TagsTable } from "./table";

export async function generateMetadata() {
  return { title: m.tags() } satisfies Metadata;
}

export default async function TagsPage() {
  return (
    <div className="lg:container lg:mx-auto">
      <TagsHeader />
      <TagsTable />
    </div>
  );
}
