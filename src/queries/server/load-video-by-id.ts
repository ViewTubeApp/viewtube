import { api } from "@/trpc/server";
import "server-only";

import { type GetVideoByIdSchema } from "@/server/api/routers/video";

export async function loadVideoById(input: GetVideoByIdSchema) {
  void api.video.getVideoById.prefetch(input);
  return api.video.getVideoById(input);
}
