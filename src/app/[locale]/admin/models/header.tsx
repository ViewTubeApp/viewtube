"use client";

import { Link } from "@/i18n/navigation";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export async function ModelsHeader() {
  const t = await getTranslations();

  return (
    <PageHeader
      title={t("models")}
      extra={
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/models/create">
            <Plus className="size-4" />
            {t("create_model")}
          </Link>
        </Button>
      }
    />
  );
}
