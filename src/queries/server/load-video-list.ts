import { api } from "@/trpc/server";
import "server-only";

import { type GetVideoListSchema } from "@/server/api/routers/video";

export async function loadVideoList(queryOptions: GetVideoListSchema) {
  void api.video.getVideoList.prefetch(queryOptions);
  return api.video.getVideoList(queryOptions);
}
