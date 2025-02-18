import { type inferProcedureOutput } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import "server-only";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { videoVotes, videos } from "@/server/db/schema";

export const createGetVideoByIdProcedure = () => {
  return publicProcedure
    .input(
      z.object({
        id: z.number(),
        shallow: z.boolean().optional(),
        related: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        const viewsCountPromise = Promise.resolve().then(async () => {
          // Increment views count
          if (input.shallow) {
            return;
          }

          return tx
            .update(videos)
            .set({ viewsCount: sql`${videos.viewsCount} + 1` })
            .where(eq(videos.id, input.id))
            .returning({ viewsCount: videos.viewsCount });
        });

        // Get video details
        const videoPromise = tx.query.videos.findFirst({
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

        const relatedPromise = Promise.resolve().then(async () => {
          if (!input.related) {
            return [];
          }

          // Get related videos
          return tx.query.videos.findMany({
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
                WHERE vv.video_id = ${videos.id}
                AND vv.vote_type = 'like'
              )`.as("likes_count"),
              dislikesCount: sql<number>`(
                SELECT COUNT(*)::int
                FROM ${videoVotes} vv
                WHERE vv.video_id = ${videos.id}
                AND vv.vote_type = 'dislike'
              )`.as("dislikes_count"),
            },
            orderBy: (videos, { desc }) => [desc(videos.createdAt)],
            where: (videos, { not, eq, and }) => and(not(eq(videos.id, input.id)), eq(videos.status, "completed")),
          });
        });

        const [video, related] = await Promise.all([videoPromise, relatedPromise, viewsCountPromise]);

        if (!video) {
          throw new Error("Video not found");
        }

        return { video, related };
      });
    });
};

export type VideoByIdResponse = inferProcedureOutput<ReturnType<typeof createGetVideoByIdProcedure>>["video"];
export type RelatedVideosResponse = inferProcedureOutput<ReturnType<typeof createGetVideoByIdProcedure>>["related"];
