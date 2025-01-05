import * as m from "@/paraglide/messages";
import { Plus } from "lucide-react";
import { type Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

import { CreateCategoryDialog } from "./dialog";
import { CategoriesTable } from "./table";

export async function generateMetadata() {
  return { title: m.categories() } satisfies Metadata;
}

export default async function CategoriesPage() {
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
      <CategoriesTable />
    </div>
  );
}
