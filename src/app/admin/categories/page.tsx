import { type Metadata } from "next";

import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Categories",
};

export default function CategoriesPage() {
  return (
    <div className="lg:container lg:mx-auto">
      <PageHeader title="Categories" />
    </div>
  );
}
