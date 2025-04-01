import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { models } from "@/server/db/schema";

export const createCreateModelProcedure = () =>
  publicProcedure
    .input(
      z.object({
        name: z.string(),
        file_key: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(models).values({ name: input.name, file_key: input.file_key });
    });
