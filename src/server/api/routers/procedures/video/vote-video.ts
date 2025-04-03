import { type IterableEventEmitter } from "@/utils/server/events";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import "server-only";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { video_votes } from "@/server/db/schema";

import { type VideoByIdResponse } from "./get-video-by-id";

interface ProcedureParams {
  type: "like" | "dislike";
  ee: IterableEventEmitter<{ update: [data: VideoByIdResponse] }>;
}

export const createVoteVideoProcedure = ({ ee, type }: ProcedureParams) => {
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
        await tx.update(video_votes).set({ vote_type: type }).where(eq(video_votes.id, vote.id));
      } else {
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
      }

      const record = await tx.query.videos.findFirst({
        with: {
          video_tags: { with: { tag: { columns: { id: true, name: true } } } },
          model_videos: { with: { model: { columns: { id: true, name: true } } } },
          category_videos: { with: { category: { columns: { id: true, slug: true } } } },
          video_votes: { columns: { session_id: true, vote_type: true } },
        },
        where: (videos, { eq }) => eq(videos.id, input.videoId),
      });

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "error_video_not_found",
        });
      }

      const likes_count = record.video_votes.filter((vote) => vote.vote_type === "like").length;
      const dislikes_count = record.video_votes.filter((vote) => vote.vote_type === "dislike").length;
      const my_vote = record.video_votes.find((vote) => vote.session_id === ctx.session?.id);

      const result = {
        ...record,
        my_vote,
        likes_count,
        dislikes_count,
      };

      ee.emit("update", result);
      return result;
    });
  });
};
