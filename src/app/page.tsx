import { loadVideoList } from "@/queries/server/load-video-list";
import { searchParamsCache } from "@/utils/server/search";
import { type SearchParams } from "nuqs/server";

import { GRID_QUERY_OPTIONS } from "@/constants/query";

import { VideoGrid } from "@/components/video-grid";

interface HomePageProps {
  searchParams: Promise<SearchParams>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q: query } = await searchParamsCache.parse(searchParams);
  const videos = await loadVideoList({ ...GRID_QUERY_OPTIONS, query });

  return <VideoGrid videos={videos} />;
}
