"use client";

import * as m from "@/paraglide/messages";
import { Plus } from "lucide-react";
import { type FC } from "react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

import { CreateCategoryDialog } from "./dialog";

export const CategoriesHeader: FC = () => {
  return (
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
  );
};
