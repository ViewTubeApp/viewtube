import { utapi } from "@/utils/server/uploadthing";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { models } from "@/server/db/schema";

export const createDeleteModelProcedure = () =>
  publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const model = await ctx.db.query.models.findFirst({ where: eq(models.id, input.id) });

      if (!model) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "error_model_not_found",
        });
      }

      await utapi.deleteFiles([model.file_key]);
      await ctx.db.delete(models).where(eq(models.id, input.id));
    });
