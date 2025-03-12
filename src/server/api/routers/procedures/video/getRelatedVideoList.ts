import { type inferProcedureOutput } from "@trpc/server";
import { sql } from "drizzle-orm";
import "server-only";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { videoVotes } from "@/server/db/schema";

export const createGetRelatedVideoListProcedure = () => {
  return publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.query.videos.findMany({
        limit: 32,
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
                WHERE vv.video_id = ${input.id}
                AND vv.vote_type = 'like'
              )`.as("likes_count"),
          dislikesCount: sql<number>`(
                SELECT COUNT(*)::int
                FROM ${videoVotes} vv
                WHERE vv.video_id = ${input.id}
                AND vv.vote_type = 'dislike'
              )`.as("dislikes_count"),
        },
        orderBy: (videos, { desc }) => [desc(videos.createdAt)],
        where: (videos, { not, eq, and }) => and(not(eq(videos.id, input.id)), eq(videos.status, "completed")),
      });
    });
};

export type RelatedVideoListResponse = inferProcedureOutput<ReturnType<typeof createGetRelatedVideoListProcedure>>;
