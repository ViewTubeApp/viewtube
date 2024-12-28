import { loadVideoList } from "@/queries/server/load-video-list";
import { searchParamsCache } from "@/utils/server/search";
import { type SearchParams } from "nuqs/server";

import { type GetVideoListSchema } from "@/server/api/routers/video";

import { publicPopularVideoListQueryOptions } from "@/constants/query";

import { VideoGrid } from "@/components/video-grid";

interface PopularPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function PopularPage({ searchParams }: PopularPageProps) {
  const { q: query } = await searchParamsCache.parse(searchParams);

  const input: GetVideoListSchema = { ...publicPopularVideoListQueryOptions, query };
  const videos = await loadVideoList(input);

  return <VideoGrid input={input} videos={videos} />;
}
