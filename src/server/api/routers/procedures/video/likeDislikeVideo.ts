import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import "server-only";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { video_votes, videos } from "@/server/db/schema";

import { type IterableEventEmitter } from "@/lib/events";

import { type VideoListElement } from "./getVideoList";

interface ProcedureParams {
  type: "like" | "dislike";
  ee: IterableEventEmitter<{ update: [data: VideoListElement] }>;
}

export const createLikeDislikeVideoProcedure = ({ ee, type }: ProcedureParams) => {
  return publicProcedure.input(z.object({ videoId: z.number() })).mutation(async ({ ctx, input }) => {
    return ctx.db.transaction(async (tx) => {
      if (!ctx.session?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "error_unauthorized",
        });
      }

      const vote = await tx.query.video_votes.findFirst({
        where: and(eq(video_votes.video_id, input.videoId), eq(video_votes.session_id, ctx.session?.id)),
      });

      if (vote) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "error_already_voted",
        });
      }

      const [inserted] = await tx
        .insert(video_votes)
        .values({
          video_id: input.videoId,
          vote_type: type,
          session_id: ctx.session.id,
        })
        .$returningId();

      if (!inserted?.id) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "error_failed_to_vote",
        });
      }

      const record = await tx.query.videos.findFirst({
        where: eq(videos.id, input.videoId),
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
            AND vv.session_id = ${ctx.session.id}
          )`.as("already_voted"),
        },
        with: {
          video_votes: true,
          video_tags: { with: { tag: true } },
          model_videos: { with: { model: true } },
          category_videos: { with: { category: true } },
        },
      });

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "error_video_not_found",
        });
      }

      ee.emit("update", record);
      return record;
    });
  });
};
