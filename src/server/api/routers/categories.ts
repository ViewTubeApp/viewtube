import { env } from "@/env";
import { deleteFile, writeFile } from "@/utils/server/file";
import { type inferTransformedProcedureOutput } from "@trpc/server";
import { type SQL, eq, sql } from "drizzle-orm";
import path from "path";
import { match } from "ts-pattern";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { categories, categoryVideos } from "@/server/db/schema";

const getCategoryListSchema = z.object({
  limit: z.number().min(1).max(128),
  offset: z.number().min(0).optional(),
  cursor: z.number().optional(),
  query: z.string().optional(),
  sortBy: z.enum(["slug", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type GetCategoryListSchema = z.infer<typeof getCategoryListSchema>;

export const categoriesRouter = createTRPCRouter({
  getCategoryList: publicProcedure.input(getCategoryListSchema).query(async ({ ctx, input }) => {
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
  }),

  getCategoryById: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.categories.findFirst({ where: eq(categories.id, input.id) });
    }),

  createCategory: publicProcedure
    .input(
      zfd.formData({
        slug: zfd.text(),
        file: zfd.file(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const file = await writeFile(input.file)
        .saveTo(env.UPLOADS_VOLUME)
        .saveAs("category", [
          {
            format: "webp",
            options: {
              width: 640,
              quality: 80,
              fit: "cover",
            },
          },
        ]);

      return ctx.db.insert(categories).values({ slug: input.slug, imageUrl: file.url }).returning();
    }),

  updateCategory: publicProcedure
    .input(
      z.object({
        id: z.number(),
        slug: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.update(categories).set({ slug: input.slug }).where(eq(categories.id, input.id)).returning();
    }),

  deleteCategory: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.query.categories.findFirst({ where: eq(categories.id, input.id) });

      if (!category) {
        throw new Error("Category not found");
      }

      await deleteFile(path.join(env.UPLOADS_VOLUME, path.basename(path.dirname(category.imageUrl))));
      return ctx.db.delete(categories).where(eq(categories.id, input.id)).returning({ id: categories.id });
    }),
});

export type APICategoryListType = inferTransformedProcedureOutput<
  typeof categoriesRouter,
  typeof categoriesRouter.getCategoryList
>;

export type APICategoryType = APICategoryListType["data"][number];
