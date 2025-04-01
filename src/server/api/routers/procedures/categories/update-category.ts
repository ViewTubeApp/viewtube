import { eq } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { categories } from "@/server/db/schema";

export const createUpdateCategoryProcedure = () => {
  return publicProcedure
    .input(
      z.object({
        id: z.number(),
        slug: z.string(),
        file_key: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(categories)
        .set({ slug: input.slug, file_key: input.file_key })
        .where(eq(categories.id, input.id));
    });
};
