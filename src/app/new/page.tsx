import { api } from "@/trpc/server";
import { searchParamsCache } from "@/utils/server/search";
import { type SearchParams } from "nuqs/server";

import { type GetVideoListSchema } from "@/server/api/routers/video";

import { publicNewVideoListQueryOptions } from "@/constants/query";

import { VideoGrid } from "@/components/video-grid";

interface NewPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function NewPage({ searchParams }: NewPageProps) {
  const { q: query } = await searchParamsCache.parse(searchParams);

  const input: GetVideoListSchema = { ...publicNewVideoListQueryOptions, query };
  const videos = await api.video.getVideoList(input);

  return <VideoGrid input={input} videos={videos} />;
}
