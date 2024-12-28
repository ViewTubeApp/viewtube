import { loadVideoList } from "@/queries/server/load-video-list";
import { searchParamsCache } from "@/utils/server/search";
import { type Metadata } from "next";
import { type SearchParams } from "nuqs";

import { type GetVideoListSchema } from "@/server/api/routers/video";

import { publicVideoListQueryOptions } from "@/constants/query";

import { VideoGrid } from "@/components/video-grid";

export const metadata: Metadata = {
  title: "Category",
};

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { q: query } = await searchParamsCache.parse(searchParams);

  const input: GetVideoListSchema = { ...publicVideoListQueryOptions, query, categorySlug: slug };
  const videos = await loadVideoList(input);

  return <VideoGrid input={input} videos={videos} />;
}
