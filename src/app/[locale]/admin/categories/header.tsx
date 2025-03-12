import { Link } from "@/i18n/navigation";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { type FC } from "react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export const CategoriesHeader: FC = async () => {
  const t = await getTranslations();

  return (
    <PageHeader
      title={t("categories")}
      extra={
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/categories/create">
            <Plus className="size-4" />
            {t("create_category")}
          </Link>
        </Button>
      }
    />
  );
};
