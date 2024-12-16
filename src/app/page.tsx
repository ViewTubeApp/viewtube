import { api } from "@/trpc/server";
import { VideoGrid } from "@/components/video-grid";
import { type SearchParams } from "nuqs/server";
import { searchParamsCache } from "@/lib/search";
import { GRID_QUERY_OPTIONS } from "@/constants/query";

interface HomePageProps {
  searchParams: Promise<SearchParams>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q: query } = await searchParamsCache.parse(searchParams);

  const videos = await api.video.getVideoList({ ...GRID_QUERY_OPTIONS, query });
  void api.video.getVideoList.prefetch({ ...GRID_QUERY_OPTIONS, query });

  return <VideoGrid videos={videos} />;
}
