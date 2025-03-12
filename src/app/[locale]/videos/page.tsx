import { api } from "@/trpc/server";
import { searchParamsCache } from "@/utils/server/search";
import { type SearchParams } from "nuqs/server";
import { match } from "ts-pattern";

import { type GetVideoListSchema } from "@/server/api/routers/video";

import {
  publicNewVideoListQueryOptions,
  publicPopularVideoListQueryOptions,
  publicVideoListQueryOptions,
} from "@/constants/query";

import { VideoGrid } from "./grid";

interface VideosPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function VideosPage({ searchParams }: VideosPageProps) {
  const { q: query, m: model, c: category, s: sort, t: tag } = await searchParamsCache.parse(searchParams);

  const defaultInput = match(sort)
    .with("new", () => publicNewVideoListQueryOptions)
    .with("popular", () => publicPopularVideoListQueryOptions)
    .otherwise(() => publicVideoListQueryOptions);

  const input: GetVideoListSchema = {
    ...defaultInput,
    query: query ?? undefined,
    model: model ?? undefined,
    category: category ?? undefined,
    tag: tag ?? undefined,
  };

  const videos = await api.video.getVideoList(input);
  await api.video.getVideoList.prefetchInfinite(input);

  return <VideoGrid input={input} videos={videos} />;
}
