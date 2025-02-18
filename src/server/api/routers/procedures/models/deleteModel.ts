import { env } from "@/env";
import { deleteFile } from "@/utils/server/file";
import { eq } from "drizzle-orm";
import path from "path";
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
        throw new Error("Model not found");
      }

      await deleteFile(path.join(env.UPLOADS_VOLUME, path.basename(path.dirname(model.imageUrl))));
      return ctx.db.delete(models).where(eq(models.id, input.id)).returning({ id: models.id });
    });
