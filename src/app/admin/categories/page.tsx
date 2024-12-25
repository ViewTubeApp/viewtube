import { loadCategoryList } from "@/queries/server/load-category-list";
import { Plus } from "lucide-react";
import { type Metadata } from "next";

import { categoryListQueryOptions } from "@/constants/query";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

import { CreateCategoryDialog } from "./dialog";
import { CategoriesTable } from "./table";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function CategoriesPage() {
  const categories = await loadCategoryList(categoryListQueryOptions);

  return (
    <div className="lg:container lg:mx-auto">
      <PageHeader
        title="Categories"
        extra={
          <CreateCategoryDialog>
            <Button variant="outline" size="sm">
              <Plus className="size-4" /> Create category
            </Button>
          </CreateCategoryDialog>
        }
      />
      <CategoriesTable initialData={categories} />
    </div>
  );
}
