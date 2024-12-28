import { loadCategoryList } from "@/queries/server/load-category-list";
import { Plus } from "lucide-react";
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { categoryListQueryOptions } from "@/constants/query";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

import { CreateCategoryDialog } from "./dialog";
import { CategoriesTable } from "./table";

export async function generateMetadata() {
  const t = await getTranslations("categories");
  return { title: t("page.title") } satisfies Metadata;
}

export default async function CategoriesPage() {
  const t = await getTranslations("categories");
  const categories = await loadCategoryList(categoryListQueryOptions);

  return (
    <div className="lg:container lg:mx-auto">
      <PageHeader
        title={t("page.title")}
        extra={
          <CreateCategoryDialog>
            <Button variant="outline" size="sm">
              <Plus className="size-4" />
              {t("dialog.title")}
            </Button>
          </CreateCategoryDialog>
        }
      />
      <CategoriesTable initialData={categories} />
    </div>
  );
}
