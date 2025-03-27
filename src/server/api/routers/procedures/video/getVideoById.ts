import { TRPCError, type inferProcedureOutput } from "@trpc/server";
import { sql } from "drizzle-orm";
import "server-only";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { video_votes, videos } from "@/server/db/schema";

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
          video_votes: true,
          video_tags: { with: { tag: true } },
          model_videos: { with: { model: true } },
          category_videos: { with: { category: true } },
        },
        extras: {
          likes_count: sql<number>`(
              SELECT COUNT(*)
              FROM ${video_votes} vv
              WHERE vv.video_id = ${videos.id}
              AND vv.vote_type = 'like'
            )`.as("likes_count"),
          dislikes_count: sql<number>`(
              SELECT COUNT(*)
              FROM ${video_votes} vv
              WHERE vv.video_id = ${videos.id}
              AND vv.vote_type = 'dislike'
            )`.as("dislikes_count"),
          already_voted: sql<boolean>`(
              SELECT COUNT(*)
              FROM ${video_votes} vv
              WHERE vv.video_id = ${videos.id}
              AND vv.session_id = ${ctx.session?.id ?? "NULL"}
            )`.as("error_already_voted"),
        },
        where: (videos, { eq }) => eq(videos.id, input.id),
      });

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "error_video_not_found",
        });
      }

      return record;
    });
};

export type VideoByIdResponse = inferProcedureOutput<ReturnType<typeof createGetVideoByIdProcedure>>;
