"use server";

import { api } from "@/trpc/server";

export interface VideoListQueryOptions {
  count: number;
  status?: ("pending" | "processing" | "completed" | "failed")[];
  query?: string | null;
}

export async function loadVideoList(queryOptions: VideoListQueryOptions) {
  void api.video.getVideoList.prefetch(queryOptions);
  return api.video.getVideoList(queryOptions);
}
