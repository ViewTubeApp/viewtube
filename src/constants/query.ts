import { type GetCategoryListSchema } from "@/server/api/routers/categories";
import { type GetVideoListSchema } from "@/server/api/routers/video";

export const adminVideoListQueryOptions: GetVideoListSchema = {
  pageSize: 32,
  pageOffset: 0,
  status: ["completed", "processing", "failed", "pending"],
};

export const publicVideoListQueryOptions: GetVideoListSchema = {
  pageSize: 32,
  pageOffset: 0,
};

export const categoryListQueryOptions: GetCategoryListSchema = {
  pageSize: 32,
  pageOffset: 0,
  sortOrder: "desc",
  sortBy: "createdAt",
};
