import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import "server-only";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { videoVotes, videos } from "@/server/db/schema";

import { type IterableEventEmitter } from "@/lib/events";

import { type VideoListElement } from "./getVideoList";

interface ProcedureParams {
  type: "like" | "dislike";
  ee: IterableEventEmitter<{ update: [data: VideoListElement] }>;
}

export const createLikeDislikeVideoProcedure = ({ ee, type }: ProcedureParams) => {
  return publicProcedure.input(z.object({ videoId: z.number() })).mutation(async ({ ctx, input }) => {
    return ctx.db.transaction(async (tx) => {
      const { videoId } = input;

      if (!ctx.session?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "error_unauthorized",
        });
      }

      let vote = await tx.query.videoVotes.findFirst({
        where: and(eq(videoVotes.videoId, videoId), eq(videoVotes.sessionId, ctx.session?.id)),
      });

      if (vote) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "error_already_voted",
        });
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
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "error_failed_to_vote",
        });
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "error_video_not_found",
        });
      }

      ee.emit("update", video);
      return video;
    });
  });
};
