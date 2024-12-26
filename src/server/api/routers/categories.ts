import { eq } from "drizzle-orm";
import { P, match } from "ts-pattern";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { categories } from "@/server/db/schema";

const getCategoryListSchema = z.object({
  query: z.string().optional().nullable(),
  pageSize: z.number().min(1).max(1024).default(32).optional(),
  pageOffset: z.number().min(0).max(1024).default(0).optional(),
  sortBy: z.enum(["name", "createdAt"]).optional().nullable(),
  sortOrder: z.enum(["asc", "desc"]).optional().nullable(),
});

export type GetCategoryListSchema = z.infer<typeof getCategoryListSchema>;

const createCategorySchema = z.object({
  name: z.string(),
});

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;

const deleteCategorySchema = z.object({
  id: z.string(),
});

export type DeleteCategorySchema = z.infer<typeof deleteCategorySchema>;

export const categoriesRouter = createTRPCRouter({
  getCategoryList: publicProcedure.input(getCategoryListSchema).query(async ({ ctx, input }) => {
    return ctx.db.query.categories.findMany({
      limit: input.pageSize,
      offset: input.pageOffset,

      orderBy: (categories, { asc, desc }) => {
        return match(input)
          .with({ sortBy: "name", sortOrder: "asc" }, () => [asc(categories.name)])
          .with({ sortBy: "name", sortOrder: "desc" }, () => [desc(categories.name)])
          .with({ sortBy: "createdAt", sortOrder: "asc" }, () => [asc(categories.createdAt)])
          .with({ sortBy: "createdAt", sortOrder: "desc" }, () => [desc(categories.createdAt)])
          .otherwise(() => [asc(categories.createdAt), asc(categories.name)]);
      },

      where: (categories, { ilike }) => {
        return match(input)
          .with({ query: P.string }, ({ query }) => ilike(categories.name, "%" + query + "%"))
          .otherwise(() => undefined);
      },
    });
  }),

  createCategory: publicProcedure.input(createCategorySchema).mutation(async ({ ctx, input }) => {
    return ctx.db.insert(categories).values({ name: input.name }).returning();
  }),

  deleteCategory: publicProcedure.input(deleteCategorySchema).mutation(async ({ ctx, input }) => {
    return ctx.db.delete(categories).where(eq(categories.id, input.id)).returning({ id: categories.id });
  }),
});
