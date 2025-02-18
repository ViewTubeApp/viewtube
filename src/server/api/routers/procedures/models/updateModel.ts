import { eq } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { models } from "@/server/db/schema";

export const createUpdateModelProcedure = () =>
  publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.update(models).set({ name: input.name }).where(eq(models.id, input.id)).returning();
    });
