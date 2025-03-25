import { eq, sql } from "drizzle-orm";
import "server-only";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { videos } from "@/server/db/schema";

export const createIncrementViewsCountProcedure = () => {
  return publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await ctx.db
        .update(videos)
        .set({ views_count: sql`${videos.views_count} + 1` })
        .where(eq(videos.id, input.id));
    });
};
