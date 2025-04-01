import { Link } from "@/i18n/navigation";
import { CloudUpload } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { type FC } from "react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export const DashboardHeader: FC = async () => {
  const t = await getTranslations();

  return (
    <PageHeader
      title={t("dashboard")}
      extra={
        <Link href="/admin/videos/create" prefetch>
          <Button variant="outline" size="sm">
            <CloudUpload className="size-4" />
            {t("upload_video")}
          </Button>
        </Link>
      }
    />
  );
};
