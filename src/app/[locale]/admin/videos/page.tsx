import { type Locale } from "@/i18n/routing";
import { api } from "@/trpc/server";
import { adminSearchParamsCache } from "@/utils/server/search";
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { type SearchParams } from "nuqs/server";

import { type GetVideoListSchema } from "@/server/api/routers/video";

import { adminVideoListQueryOptions } from "@/constants/query";

import { DashboardHeader } from "./header";
import { DashboardVideoTable } from "./table";

interface DashboardPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ params }: DashboardPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t("dashboard") } satisfies Metadata;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { page, q: searchQuery } = await adminSearchParamsCache.parse(searchParams);

  const input: GetVideoListSchema = {
    ...adminVideoListQueryOptions,
    query: searchQuery,
    offset: page.pageIndex * page.pageSize,
    limit: page.pageSize,
  };

  const videos = await api.video.getVideoList(input);
  await api.video.getVideoList.prefetch(input);

  return (
    <div className="lg:container lg:mx-auto">
      <DashboardHeader />
      <DashboardVideoTable input={input} videos={videos} />
    </div>
  );
}
