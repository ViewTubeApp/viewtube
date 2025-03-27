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
      return ctx.db.transaction(async (tx) => {
        const record = await tx.query.videos.findFirst({ where: (videos, { eq }) => eq(videos.id, input.id) });

        if (!record) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "error_video_not_found",
          });
        }

        // TODO: delete video from UFS

        await tx.delete(videos).where(eq(videos.id, input.id));
      });
    });
};
