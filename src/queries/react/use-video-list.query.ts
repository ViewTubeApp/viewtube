import { api } from "@/trpc/react";

import { type GetVideoListSchema } from "@/server/api/routers/video";
import { type VideoExtended } from "@/server/db/schema";

export function useVideoListQuery(queryOptions: GetVideoListSchema, initialData?: VideoExtended[]) {
  return api.video.getVideoList.useQuery(queryOptions, { initialData });
}
