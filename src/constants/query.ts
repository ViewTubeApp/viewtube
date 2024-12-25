import { type VideoListQueryOptions } from "@/queries/react/use-video-list-query";

import { type GetCategoriesSchema } from "@/server/api/routers/categories";

export const LOAD_COUNT = 128;
export const RELATED_LOAD_COUNT = 16;

export const DASHBOARD_QUERY_OPTIONS: VideoListQueryOptions = {
  count: LOAD_COUNT,
  status: ["completed", "processing", "failed", "pending"],
};

export const GRID_QUERY_OPTIONS = {
  count: LOAD_COUNT,
};

export const CATEGORY_LIST_QUERY_OPTIONS: GetCategoriesSchema = {
  pageSize: 10,
  pageOffset: 0,
  sortOrder: "desc",
  sortBy: "createdAt",
};
