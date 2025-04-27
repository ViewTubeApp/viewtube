import { utapi } from "@/utils/server/uploadthing";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { categories } from "@/server/db/schema";

export const createDeleteCategoryProcedure = () => {
  return publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.query.categories.findFirst({ where: eq(categories.id, input.id) });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "error_category_not_found",
        });
      }

      await utapi.deleteFiles(category.file_key);
      await ctx.db.delete(categories).where(eq(categories.id, input.id));
    });
};
