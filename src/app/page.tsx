import { api } from "@/trpc/server";
import { VideoGrid } from "@/components/video-grid";
import { type SearchParams } from "nuqs/server";
import { searchParamsCache } from "@/lib/search";
import { LOAD_COUNT } from "@/constants/query";

interface HomePageProps {
  searchParams: Promise<SearchParams>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q: query } = await searchParamsCache.parse(searchParams);

  const videos = await api.video.getVideoList({ count: LOAD_COUNT, query });
  void api.video.getVideoList.prefetch({ count: LOAD_COUNT, query });

  return <VideoGrid videos={videos} />;
}
