import { api } from "@/trpc/react";

import { type VideoExtended } from "@/server/db/schema";

export interface VideoListQueryOptions {
  count: number;
  status?: ("pending" | "processing" | "completed" | "failed")[];
  query?: string | null;
}

export function useVideoListQuery(queryOptions: VideoListQueryOptions, initialData?: VideoExtended[]) {
  return api.video.getVideoList.useQuery(queryOptions, { initialData });
}
