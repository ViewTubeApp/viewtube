import { env } from "@/env";
import { deleteFile } from "@/utils/server/file";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import path from "path";
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
      const video = await ctx.db.query.videos.findFirst({ where: (videos, { eq }) => eq(videos.id, input.id) });

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "error_video_not_found",
        });
      }

      await deleteFile(path.join(env.UPLOADS_VOLUME, path.basename(path.dirname(video.url))));
      await ctx.db.delete(videos).where(eq(videos.id, input.id));
    });
};
