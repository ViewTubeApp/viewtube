import { and, eq, sql } from "drizzle-orm";
import "server-only";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { videoVotes, videos } from "@/server/db/schema";

import { type IterableEventEmitter } from "@/lib/events";

import { type APIVideoType } from "./getVideoList";

interface ProcedureParams {
  type: "like" | "dislike";
  ee: IterableEventEmitter<{ update: [data: APIVideoType] }>;
}

export const createLikeDislikeVideoProcedure = ({ ee, type }: ProcedureParams) => {
  return publicProcedure.input(z.object({ videoId: z.number() })).mutation(async ({ ctx, input }) => {
    return ctx.db.transaction(async (tx) => {
      const { videoId } = input;

      if (!ctx.session?.id) {
        throw new Error("Unauthorized");
      }

      let vote = await tx.query.videoVotes.findFirst({
        where: and(eq(videoVotes.videoId, videoId), eq(videoVotes.sessionId, ctx.session?.id)),
      });

      if (vote) {
        throw new Error("You already voted for this video");
      }

      [vote] = await tx
        .insert(videoVotes)
        .values({
          videoId,
          voteType: type,
          sessionId: ctx.session.id,
        })
        .returning();

      if (!vote) {
        throw new Error("Failed to vote for video");
      }

      const video = await tx.query.videos.findFirst({
        where: eq(videos.id, videoId),
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
            AND vv.session_id = ${ctx.session.id}
          )`.as("already_voted"),
        },
        with: {
          videoVotes: true,
          videoTags: { with: { tag: true } },
          modelVideos: { with: { model: true } },
          categoryVideos: { with: { category: true } },
        },
      });

      if (!video) {
        throw new Error("Video not found");
      }

      ee.emit("update", video);
      return video;
    });
  });
};
