import { api } from "@/trpc/react";

import { type GetVideoListSchema, type VideoListResponse } from "@/server/api/routers/video";

export function useVideoListQuery(queryOptions: GetVideoListSchema, initialData?: VideoListResponse) {
  return api.video.getVideoList.useQuery(queryOptions, { initialData });
}
