import { inferProcedureOutput } from "@trpc/server";
import { type SQL, sql } from "drizzle-orm";
import { match } from "ts-pattern";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { categories } from "@/server/db/schema";
import { categoryVideos } from "@/server/db/schema";

const getCategoryListSchema = z.object({
  limit: z.number().min(1).max(128),
  offset: z.number().min(0).optional(),
  cursor: z.number().optional(),
  query: z.string().optional(),
  sortBy: z.enum(["slug", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type GetCategoryListSchema = z.infer<typeof getCategoryListSchema>;

export const createGetCategoryListProcedure = () => {
  return publicProcedure.input(getCategoryListSchema).query(async ({ ctx, input }) => {
    const listPromise = ctx.db.query.categories.findMany({
      limit: input.limit + 1,
      offset: input.offset,

      extras: {
        assignedVideosCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${categoryVideos}
          WHERE ${categoryVideos.categoryId} = ${categories.id}
        )`.as("assigned_videos_count"),
      },

      orderBy: (categories, { asc, desc }) => {
        return match(input)
          .with({ sortBy: "slug", sortOrder: "asc" }, () => [asc(categories.slug)])
          .with({ sortBy: "slug", sortOrder: "desc" }, () => [desc(categories.slug)])
          .with({ sortBy: "createdAt", sortOrder: "asc" }, () => [asc(categories.createdAt)])
          .with({ sortBy: "createdAt", sortOrder: "desc" }, () => [desc(categories.createdAt)])
          .otherwise(() => [asc(categories.createdAt), asc(categories.slug)]);
      },

      where: (categories, { ilike, lt, gt, and }) => {
        const args: Array<SQL | undefined> = [];

        // Filter by query
        if (input.query) {
          args.push(
            // Filter by title
            ilike(categories.slug, "%" + input.query + "%"),
          );
        }

        // Filter by cursor
        if (input.cursor) {
          const operatorFn = match(input)
            .with({ sortOrder: "desc" }, () => lt)
            .with({ sortOrder: "asc" }, () => gt)
            .exhaustive();

          args.push(operatorFn(categories.id, input.cursor));
        }

        return and(...args);
      },
    });

    const totalPromise = ctx.db.$count(categories);
    const [list, total] = await Promise.all([listPromise, totalPromise]);

    let nextCursor: typeof input.cursor | undefined;

    if (list.length > input.limit) {
      const nextItem = list.pop();
      nextCursor = nextItem?.id;
    }

    return {
      data: list,
      meta: { total, nextCursor },
    };
  });
};

export type APICategoryListType = inferProcedureOutput<ReturnType<typeof createGetCategoryListProcedure>>;
export type APICategoryType = APICategoryListType["data"][number];
