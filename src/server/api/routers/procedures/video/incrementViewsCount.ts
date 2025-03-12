import { eq, sql } from "drizzle-orm";
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
      return ctx.db
        .update(videos)
        .set({ viewsCount: sql`${videos.viewsCount} + 1` })
        .where(eq(videos.id, input.id))
        .returning({ viewsCount: videos.viewsCount });
    });
};
