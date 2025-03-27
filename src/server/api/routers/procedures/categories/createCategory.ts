import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { categories } from "@/server/db/schema";

export const createCreateCategoryProcedure = () => {
  return publicProcedure
    .input(
      z.object({
        slug: z.string(),
        file_key: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [inserted] = await ctx.db
        .insert(categories)
        .values({ slug: input.slug, file_key: input.file_key })
        .$returningId();

      if (!inserted?.id) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "error_failed_to_create_category",
        });
      }

      return ctx.db.query.categories.findFirst({ where: eq(categories.id, inserted.id) });
    });
};
