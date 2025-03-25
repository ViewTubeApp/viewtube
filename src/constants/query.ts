import { type GetCategoryListSchema } from "@/server/api/routers/categories";
import { type GetModelListSchema } from "@/server/api/routers/models";
import { type GetTagListSchema } from "@/server/api/routers/tags";
import { type GetVideoListSchema } from "@/server/api/routers/video";

export const adminVideoListQueryOptions: GetVideoListSchema = {
  limit: 10,
  offset: 0,
  status: ["completed", "processing", "failed", "pending"],
  sortBy: "created_at",
  sortOrder: "desc",
};

export const publicVideoListQueryOptions: GetVideoListSchema = {
  limit: 32,
  sortBy: "created_at",
  sortOrder: "desc",
};

export const publicPopularVideoListQueryOptions: GetVideoListSchema = {
  limit: 32,
  sortBy: "views_count",
  sortOrder: "desc",
};

export const publicNewVideoListQueryOptions: GetVideoListSchema = {
  limit: 32,
  sortBy: "created_at",
  sortOrder: "desc",
};

export const adminCategoryListQueryOptions: GetCategoryListSchema = {
  limit: 10,
  offset: 0,
  sortBy: "created_at",
  sortOrder: "desc",
};

export const adminTagListQueryOptions: GetTagListSchema = {
  limit: 10,
  offset: 0,
  sortBy: "created_at",
  sortOrder: "desc",
};

export const adminModelListQueryOptions: GetModelListSchema = {
  limit: 10,
  offset: 0,
  sortBy: "created_at",
  sortOrder: "desc",
} as const;
