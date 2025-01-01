import * as m from "@/paraglide/messages";
import { loadCategoryList } from "@/queries/server/load-category-list";
import { Plus } from "lucide-react";
import { type Metadata } from "next";

import { categoryListQueryOptions } from "@/constants/query";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

import { CreateCategoryDialog } from "./dialog";
import { CategoriesTable } from "./table";

export async function generateMetadata() {
  return { title: m.categories() } satisfies Metadata;
}

export default async function CategoriesPage() {
  const categories = await loadCategoryList(categoryListQueryOptions);

  return (
    <div className="lg:container lg:mx-auto">
      <PageHeader
        title={m.categories()}
        extra={
          <CreateCategoryDialog>
            <Button variant="outline" size="sm">
              <Plus className="size-4" />
              {m.create_category()}
            </Button>
          </CreateCategoryDialog>
        }
      />
      <CategoriesTable initialData={categories} />
    </div>
  );
}
