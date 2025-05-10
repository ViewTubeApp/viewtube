import { utapi } from "@/utils/server/utapi";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import "server-only";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { videos } from "@/server/db/schema";

export const createDeleteVideoProcedure = () => {
  return publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const record = await ctx.db.query.videos.findFirst({ where: (videos, { eq }) => eq(videos.id, input.id) });

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "error_video_not_found",
        });
      }

      {
        const files = [
          record.file_key,
          record.poster_key,
          record.trailer_key,
          record.storyboard_key,
          record.thumbnail_key,
        ].filter(Boolean) as string[];

        await utapi.deleteFiles(files);
      }

      await ctx.db.delete(videos).where(eq(videos.id, input.id));
    });
};
