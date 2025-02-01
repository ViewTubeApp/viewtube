"use client";

import * as m from "@/paraglide/messages";
import { Plus } from "lucide-react";
import { type FC } from "react";

import { Link } from "@/lib/i18n";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export const CategoriesHeader: FC = () => {
  return (
    <PageHeader
      title={m.categories()}
      extra={
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/categories/create">
            <Plus className="size-4" />
            {m.create_category()}
          </Link>
        </Button>
      }
    />
  );
};
