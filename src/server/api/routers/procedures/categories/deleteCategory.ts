import { env } from "@/env";
import { deleteFile } from "@/utils/server/file";
import { eq } from "drizzle-orm";
import path from "path";
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
        throw new Error("Category not found");
      }

      await deleteFile(path.join(env.UPLOADS_VOLUME, path.basename(path.dirname(category.imageUrl))));
      return ctx.db.delete(categories).where(eq(categories.id, input.id)).returning({ id: categories.id });
    });
};
