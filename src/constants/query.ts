import { type GetCategoryListSchema } from "@/server/api/routers/categories";
import { type GetTagListSchema } from "@/server/api/routers/tags";
import { type GetVideoListSchema } from "@/server/api/routers/video";

export const adminVideoListQueryOptions: GetVideoListSchema = {
  limit: 10,
  offset: 0,
  status: ["completed", "processing", "failed", "pending"],
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const publicVideoListQueryOptions: GetVideoListSchema = {
  limit: 32,
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const publicPopularVideoListQueryOptions: GetVideoListSchema = {
  limit: 32,
  sortBy: "viewsCount",
  sortOrder: "desc",
};

export const publicNewVideoListQueryOptions: GetVideoListSchema = {
  limit: 32,
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const adminCategoryListQueryOptions: GetCategoryListSchema = {
  limit: 10,
  offset: 0,
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const adminTagListQueryOptions: GetTagListSchema = {
  limit: 10,
  offset: 0,
  sortBy: "createdAt",
  sortOrder: "desc",
};
