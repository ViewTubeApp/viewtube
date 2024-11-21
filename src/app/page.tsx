import { api } from "@/trpc/server";
import { VideoGrid } from "@/components/video-grid";
import { type SearchParams } from "nuqs/server";
import { searchParamsCache } from "@/lib/search";

interface HomePageProps {
  searchParams: Promise<SearchParams>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q: query } = await searchParamsCache.parse(searchParams);

  const videos = await api.video.latest({ count: 10, query });
  void api.video.latest.prefetch({ count: 10, query });

  return <VideoGrid videos={videos} />;
}
