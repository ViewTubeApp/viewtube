import { Link } from "@/i18n/routing";
import { loadVideoList } from "@/queries/server/load-video-list";
import { CloudUpload } from "lucide-react";
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { adminVideoListQueryOptions } from "@/constants/query";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

import { DashboardVideoTable } from "./table";

export async function generateMetadata() {
  const t = await getTranslations("dashboard");
  return { title: t("page.title") } satisfies Metadata;
}

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const videos = await loadVideoList(adminVideoListQueryOptions);

  return (
    <div className="lg:container lg:mx-auto">
      <PageHeader
        title={t("page.title")}
        extra={
          <Link href="/admin/upload">
            <Button variant="outline" size="sm">
              <CloudUpload className="size-4" />
              {t("dialog.title")}
            </Button>
          </Link>
        }
      />
      <DashboardVideoTable videos={videos} />
    </div>
  );
}
