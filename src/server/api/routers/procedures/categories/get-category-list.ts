import type { inferProcedureOutput } from "@trpc/server";
import { type SQL, sql } from "drizzle-orm";
import { match } from "ts-pattern";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { categories } from "@/server/db/schema";
import { category_videos } from "@/server/db/schema";

import { formatListResponse } from "../../utils/common";

const getCategoryListSchema = z.object({
  limit: z.number().min(1).max(128),
  offset: z.number().min(0).optional(),
  cursor: z.number().optional(),
  query: z.string().optional(),
  sortBy: z.enum(["slug", "created_at"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type GetCategoryListSchema = z.infer<typeof getCategoryListSchema>;

export const createGetCategoryListProcedure = () => {
  return publicProcedure.input(getCategoryListSchema).query(async ({ ctx, input }) => {
    const lp = ctx.db.query.categories.findMany({
      limit: input.limit + 1,
      offset: input.offset,

      extras: {
        assigned_videos_count: sql<number>`(
          SELECT COUNT(*)
          FROM ${category_videos}
          WHERE ${category_videos.category_id} = ${categories.id}
        )`.as("assigned_videos_count"),
      },

      orderBy: (categories, { asc, desc }) => {
        return match(input)
          .with({ sortBy: "slug", sortOrder: "asc" }, () => [asc(categories.slug)])
          .with({ sortBy: "slug", sortOrder: "desc" }, () => [desc(categories.slug)])
          .with({ sortBy: "created_at", sortOrder: "asc" }, () => [asc(categories.created_at)])
          .with({ sortBy: "created_at", sortOrder: "desc" }, () => [desc(categories.created_at)])
          .otherwise(() => [asc(categories.created_at), asc(categories.slug)]);
      },

      where: (categories, { ilike, lt, gt, and }) => {
        const filters: Array<SQL | undefined> = [];

        // Filter by query
        if (input.query) {
          filters.push(
            // Filter by title
            ilike(categories.slug, "%" + input.query + "%"),
          );
        }

        // Filter by cursor
        if (input.cursor) {
          const fn = match(input)
            .with({ sortOrder: "desc" }, () => lt)
            .with({ sortOrder: "asc" }, () => gt)
            .exhaustive();

          filters.push(fn(categories.id, input.cursor));
        }

        return and(...filters);
      },
    });

    const tp = ctx.db.$count(categories);
    const [list, total] = await Promise.all([lp, tp]);
    return formatListResponse(list, total, input.limit);
  });
};

export type CategoryListResponse = inferProcedureOutput<ReturnType<typeof createGetCategoryListProcedure>>;
export type CategoryListElement = CategoryListResponse["data"][number];
