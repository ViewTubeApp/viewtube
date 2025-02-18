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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.update(categories).set({ slug: input.slug }).where(eq(categories.id, input.id)).returning();
    });
};
