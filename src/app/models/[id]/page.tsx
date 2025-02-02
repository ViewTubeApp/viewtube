import { api } from "@/trpc/server";
import { searchParamsCache } from "@/utils/server/search";
import { type Metadata } from "next";
import { type SearchParams } from "nuqs";

import { type GetVideoListSchema } from "@/server/api/routers/video";

import { publicVideoListQueryOptions } from "@/constants/query";

import { VideoGrid } from "@/components/video-grid";

interface ModelPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ params }: ModelPageProps) {
  const { id } = await params;
  const model = await api.models.getModelById({ id: Number(id) });
  return { title: model?.name } satisfies Metadata;
}

export default async function ModelPage({ params, searchParams }: ModelPageProps) {
  const { id } = await params;
  const { q: query } = await searchParamsCache.parse(searchParams);

  const input: GetVideoListSchema = { ...publicVideoListQueryOptions, query, model: Number(id) };
  const videos = await api.video.getVideoList(input);

  return <VideoGrid input={input} videos={videos} />;
}
