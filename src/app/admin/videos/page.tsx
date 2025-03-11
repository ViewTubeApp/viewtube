import * as m from "@/paraglide/messages";
import { api } from "@/trpc/server";
import { adminSearchParamsCache } from "@/utils/server/search";
import { type Metadata } from "next";
import { SearchParams } from "nuqs/server";

import { GetVideoListSchema } from "@/server/api/routers/video";

import { adminVideoListQueryOptions } from "@/constants/query";

import { DashboardHeader } from "./header";
import { DashboardVideoTable } from "./table";

export async function generateMetadata() {
  return { title: m.dashboard() } satisfies Metadata;
}

interface DashboardPageProps {
  searchParams: Promise<SearchParams>;
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
