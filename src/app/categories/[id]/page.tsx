import { api } from "@/trpc/server";
import { searchParamsCache } from "@/utils/server/search";
import { type Metadata } from "next";
import { type SearchParams } from "nuqs";

import { type GetVideoListSchema } from "@/server/api/routers/video";

import { publicVideoListQueryOptions } from "@/constants/query";

import { VideoGrid } from "@/components/video-grid";

interface CategoryPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { id } = await params;
  const category = await api.categories.getCategoryById({ id });
  return { title: category?.slug } satisfies Metadata;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { id } = await params;
  const { q: query } = await searchParamsCache.parse(searchParams);

  const input: GetVideoListSchema = { ...publicVideoListQueryOptions, query, categoryId: id };
  const videos = await api.video.getVideoList(input);

  return <VideoGrid input={input} videos={videos} />;
}
