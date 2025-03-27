import { eq } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { models } from "@/server/db/schema";

export const createUpdateModelProcedure = () =>
  publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        file_key: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(models)
        .set({
          name: input.name,
          file_key: input.file_key,
        })
        .where(eq(models.id, input.id));
    });
