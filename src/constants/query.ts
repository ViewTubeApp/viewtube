import { type GetCategoryListSchema } from "@/server/api/routers/categories";
import { type GetModelListSchema } from "@/server/api/routers/models";
import { type GetTagListSchema } from "@/server/api/routers/tags";
import { type GetVideoListSchema } from "@/server/api/routers/video";

export const filters = {
  video: {
    list: {
      admin: {
        limit: 10,
        offset: 0,
        status: ["completed", "processing", "failed", "pending"],
        sortBy: "created_at",
        sortOrder: "desc",
      } satisfies GetVideoListSchema,
      public: {
        limit: 32,
        sortBy: "created_at",
        sortOrder: "desc",
      } satisfies GetVideoListSchema,
      popular: {
        limit: 32,
        sortBy: "views_count",
        sortOrder: "desc",
      } satisfies GetVideoListSchema,
      new: {
        limit: 32,
        sortBy: "created_at",
        sortOrder: "desc",
      } satisfies GetVideoListSchema,
    },
  },

  category: {
    list: {
      admin: {
        limit: 10,
        offset: 0,
        sortBy: "created_at",
        sortOrder: "desc",
      } satisfies GetCategoryListSchema,
      public: {
        limit: 32,
        sortBy: "created_at",
        sortOrder: "desc",
      } satisfies GetCategoryListSchema,
    },
  },

  tag: {
    list: {
      admin: {
        limit: 10,
        offset: 0,
        sortBy: "created_at",
        sortOrder: "desc",
      } satisfies GetTagListSchema,
      public: {
        limit: 32,
        sortBy: "created_at",
        sortOrder: "desc",
      } satisfies GetTagListSchema,
    },
  },

  model: {
    list: {
      admin: {
        limit: 10,
        offset: 0,
        sortBy: "created_at",
        sortOrder: "desc",
      } satisfies GetModelListSchema,
      public: {
        limit: 32,
        sortBy: "created_at",
        sortOrder: "desc",
      } satisfies GetModelListSchema,
    },
  },
} as const;
