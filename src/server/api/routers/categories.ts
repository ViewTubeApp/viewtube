import { type inferTransformedProcedureOutput } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { P, match } from "ts-pattern";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { categories, categoryVideos } from "@/server/db/schema";

const getCategoryListSchema = z.object({
  query: z.string().optional().nullable(),
  pageSize: z.number().min(1).max(1024).default(32).optional(),
  pageOffset: z.number().min(0).max(1024).default(0).optional(),
  sortBy: z.enum(["slug", "createdAt"]).optional().nullable(),
  sortOrder: z.enum(["asc", "desc"]).optional().nullable(),
});

export type GetCategoryListSchema = z.infer<typeof getCategoryListSchema>;

const createCategorySchema = z.object({
  slug: z.string(),
});

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;

const deleteCategorySchema = z.object({
  id: z.string(),
});

export type DeleteCategorySchema = z.infer<typeof deleteCategorySchema>;

const getCategoryByIdSchema = z.object({
  id: z.string(),
});

export type GetCategoryByIdSchema = z.infer<typeof getCategoryByIdSchema>;

const updateCategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
});

export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;

export const categoriesRouter = createTRPCRouter({
  getCategoryList: publicProcedure.input(getCategoryListSchema).query(async ({ ctx, input }) => {
    return ctx.db.query.categories.findMany({
      limit: input.pageSize,
      offset: input.pageOffset,

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

      where: (categories, { ilike }) => {
        return match(input)
          .with({ query: P.string }, ({ query }) => ilike(categories.slug, "%" + query + "%"))
          .otherwise(() => undefined);
      },
    });
  }),

  getCategoryById: publicProcedure.input(getCategoryByIdSchema).query(async ({ ctx, input }) => {
    return ctx.db.query.categories.findFirst({ where: eq(categories.id, input.id) });
  }),

  createCategory: publicProcedure.input(createCategorySchema).mutation(async ({ ctx, input }) => {
    return ctx.db.insert(categories).values({ slug: input.slug }).returning();
  }),

  updateCategory: publicProcedure.input(updateCategorySchema).mutation(async ({ ctx, input }) => {
    return ctx.db.update(categories).set({ slug: input.slug }).where(eq(categories.id, input.id)).returning();
  }),

  deleteCategory: publicProcedure.input(deleteCategorySchema).mutation(async ({ ctx, input }) => {
    return ctx.db.delete(categories).where(eq(categories.id, input.id)).returning({ id: categories.id });
  }),
});

export type CategoryListResponse = inferTransformedProcedureOutput<
  typeof categoriesRouter,
  typeof categoriesRouter.getCategoryList
>;

export type CategoryResponse = CategoryListResponse[number];
