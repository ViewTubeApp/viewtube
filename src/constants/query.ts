import { type VideoListQueryOptions } from "@/queries/react/use-video-list-query";

export const LOAD_COUNT = 128;
export const RELATED_LOAD_COUNT = 16;

export const DASHBOARD_QUERY_OPTIONS: VideoListQueryOptions = {
  count: LOAD_COUNT,
  status: ["completed", "processing", "failed", "pending"],
};

export const GRID_QUERY_OPTIONS = {
  count: LOAD_COUNT,
};
