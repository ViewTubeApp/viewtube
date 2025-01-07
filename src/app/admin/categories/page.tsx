import * as m from "@/paraglide/messages";
import { type Metadata } from "next";

import { CategoriesHeader } from "./header";
import { CategoriesTable } from "./table";

export async function generateMetadata() {
  return { title: m.categories() } satisfies Metadata;
}

export default async function CategoriesPage() {
  return (
    <div className="lg:container lg:mx-auto">
      <CategoriesHeader />
      <CategoriesTable />
    </div>
  );
}
