import { P, match } from "ts-pattern";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

const getCategoriesSchema = z.object({
  query: z.string().optional().nullable(),
  pageSize: z.number().min(1).max(1024).default(32),
  pageOffset: z.number().min(0).max(1024).default(0),
  sortBy: z.enum(["name", "createdAt"]).optional().nullable(),
  sortOrder: z.enum(["asc", "desc"]).optional().nullable(),
});

export type GetCategoriesSchema = z.infer<typeof getCategoriesSchema>;

export const categoriesRouter = createTRPCRouter({
  getCategories: publicProcedure.input(getCategoriesSchema).query(async ({ ctx, input }) => {
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
});
