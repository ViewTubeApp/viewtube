import { eq } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { tags } from "@/server/db/schema";

export const createDeleteTagProcedure = () =>
  publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(tags).where(eq(tags.id, input.id)).returning({ id: tags.id });
    });
