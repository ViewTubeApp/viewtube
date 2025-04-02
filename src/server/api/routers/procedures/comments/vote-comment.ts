import { type IterableEventEmitter } from "@/utils/server/events";
import { eq, sql } from "drizzle-orm";
import { match } from "ts-pattern";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { type CommentSelectSchema, comments } from "@/server/db/schema";

type CommentWithReplies = CommentSelectSchema & {
  replies: CommentSelectSchema[];
};

type ActionType = "like" | "dislike";

interface LikeDislikeCommentProcedureParams {
  ee: IterableEventEmitter<{ update: [data: CommentWithReplies] }>;
  type: ActionType;
}

export const createVoteCommentProcedure = ({ ee, type }: LikeDislikeCommentProcedureParams) =>
  publicProcedure
    .input(
      z.object({
        commentId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const key = match(type)
        .with("like", () => "likes_count" as const)
        .with("dislike", () => "dislikes_count" as const)
        .exhaustive();

      const column = match(type)
        .with("like", () => comments.likes_count)
        .with("dislike", () => comments.dislikes_count)
        .exhaustive();

      await ctx.db
        .update(comments)
        .set({ [key]: sql`${column} + 1` })
        .where(eq(comments.id, input.commentId));

      const comment = await ctx.db.query.comments.findFirst({
        where: eq(comments.id, input.commentId),
        with: { replies: true },
      });

      if (comment) {
        ee.emit("update", comment);
      }

      return comment;
    });
