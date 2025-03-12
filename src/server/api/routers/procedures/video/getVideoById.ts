import { type inferProcedureOutput } from "@trpc/server";
import { sql } from "drizzle-orm";
import "server-only";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { videoVotes, videos } from "@/server/db/schema";

export const createGetVideoByIdProcedure = () => {
  return publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const video = await ctx.db.query.videos.findFirst({
        with: {
          videoVotes: true,
          videoTags: { with: { tag: true } },
          modelVideos: { with: { model: true } },
          categoryVideos: { with: { category: true } },
        },
        extras: {
          likesCount: sql<number>`(
              SELECT COUNT(*)::int
              FROM ${videoVotes} vv
              WHERE vv.video_id = ${videos.id}
              AND vv.vote_type = 'like'
            )`.as("likes_count"),
          dislikesCount: sql<number>`(
              SELECT COUNT(*)::int
              FROM ${videoVotes} vv
              WHERE vv.video_id = ${videos.id}
              AND vv.vote_type = 'dislike'
            )`.as("dislikes_count"),
          alreadyVoted: sql<boolean>`(
              SELECT COUNT(*)::int
              FROM ${videoVotes} vv
              WHERE vv.video_id = ${videos.id}
              AND vv.session_id = ${ctx.session?.id ?? "NULL"}
            )`.as("already_voted"),
        },
        where: (videos, { eq }) => eq(videos.id, input.id),
      });

      if (!video) {
        throw new Error("Video not found");
      }

      return video;
    });
};

export type VideoByIdResponse = inferProcedureOutput<ReturnType<typeof createGetVideoByIdProcedure>>;
