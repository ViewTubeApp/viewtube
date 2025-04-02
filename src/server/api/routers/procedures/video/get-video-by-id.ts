import { TRPCError, type inferProcedureOutput } from "@trpc/server";
import { eq } from "drizzle-orm";
import "server-only";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { video_votes } from "@/server/db/schema";

export const createGetVideoByIdProcedure = () => {
  return publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const record = await ctx.db.query.videos.findFirst({
        with: {
          video_votes: { where: eq(video_votes.session_id, ctx.session?.id ?? "NULL") },
          video_tags: { with: { tag: true } },
          model_videos: { with: { model: true } },
          category_videos: { with: { category: true } },
        },
        where: (videos, { eq }) => eq(videos.id, input.id),
      });

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "error_video_not_found",
        });
      }

      const likes = record.video_votes.filter((vote) => vote.vote_type === "like").length;
      const dislikes = record.video_votes.filter((vote) => vote.vote_type === "dislike").length;

      return {
        ...record,
        likes_count: likes,
        dislikes_count: dislikes,
        already_voted: likes > 0 || dislikes > 0,
      };
    });
};

export type VideoByIdResponse = inferProcedureOutput<ReturnType<typeof createGetVideoByIdProcedure>>;
