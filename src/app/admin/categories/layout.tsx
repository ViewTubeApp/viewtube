import * as m from "@/paraglide/messages";
import { type Metadata } from "next";
import { type PropsWithChildren } from "react";

import { CategoriesHeader } from "./header";
import { CategoriesTable } from "./table";

export async function generateMetadata() {
  return { title: m.categories() } satisfies Metadata;
}

export default function CategoriesLayout({ children }: PropsWithChildren) {
  return (
    <div className="lg:container lg:mx-auto">
      <CategoriesHeader />
      <CategoriesTable />
      {children}
    </div>
  );
}
