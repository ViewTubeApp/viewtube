import { loadVideoList } from "@/queries/server/load-video-list";
import { searchParamsCache } from "@/utils/server/search";
import { type SearchParams } from "nuqs/server";

import { publicVideoListQueryOptions } from "@/constants/query";

import { VideoGrid } from "@/components/video-grid";

interface HomePageProps {
  searchParams: Promise<SearchParams>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q: query } = await searchParamsCache.parse(searchParams);
  const videos = await loadVideoList({ ...publicVideoListQueryOptions, query });

  return <VideoGrid videos={videos} />;
}
