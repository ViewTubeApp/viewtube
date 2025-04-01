import { type inferProcedureOutput } from "@trpc/server";
import { sql } from "drizzle-orm";
import "server-only";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { video_votes } from "@/server/db/schema";

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
          video_votes: true,
          video_tags: { with: { tag: true } },
          model_videos: { with: { model: true } },
          category_videos: { with: { category: true } },
        },
        extras: {
          likes_count: sql<number>`(
                SELECT COUNT(*)
                FROM ${video_votes} vv
                WHERE vv.video_id = ${input.id}
                AND vv.vote_type = 'like'
              )`.as("likes_count"),
          dislikes_count: sql<number>`(
                SELECT COUNT(*)
                FROM ${video_votes} vv
                WHERE vv.video_id = ${input.id}
                AND vv.vote_type = 'dislike'
              )`.as("dislikes_count"),
        },
        orderBy: (videos, { desc }) => [desc(videos.created_at)],
        where: (videos, { not, eq, and }) => and(not(eq(videos.id, input.id)), eq(videos.status, "completed")),
      });
    });
};

export type RelatedVideoListResponse = inferProcedureOutput<ReturnType<typeof createGetRelatedVideoListProcedure>>;
