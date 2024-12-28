import { type GetCategoryListSchema } from "@/server/api/routers/categories";
import { type GetVideoListSchema } from "@/server/api/routers/video";

export const adminVideoListQueryOptions: GetVideoListSchema = {
  pageSize: 32,
  pageOffset: 0,
  status: ["completed", "processing", "failed", "pending"],
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const publicVideoListQueryOptions: GetVideoListSchema = {
  pageSize: 32,
  pageOffset: 0,
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const publicPopularVideoListQueryOptions: GetVideoListSchema = {
  pageSize: 32,
  pageOffset: 0,
  sortBy: "viewsCount",
  sortOrder: "desc",
};

export const publicNewVideoListQueryOptions: GetVideoListSchema = {
  pageSize: 32,
  pageOffset: 0,
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const categoryListQueryOptions: GetCategoryListSchema = {
  pageSize: 32,
  pageOffset: 0,
  sortOrder: "desc",
  sortBy: "createdAt",
};
