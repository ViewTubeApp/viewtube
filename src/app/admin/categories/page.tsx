import { loadCategoryList } from "@/queries/server/load-category-list";
import { type Metadata } from "next";

import { CATEGORY_LIST_QUERY_OPTIONS } from "@/constants/query";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/ui/data-table";

import { columns } from "./columns";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function CategoriesPage() {
  const categories = await loadCategoryList(CATEGORY_LIST_QUERY_OPTIONS);

  return (
    <div className="lg:container lg:mx-auto">
      <PageHeader title="Categories" />
      <DataTable columns={columns} data={categories} />
    </div>
  );
}
