import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { type CommentSelectSchema, comments } from "@/server/db/schema";

import { type IterableEventEmitter } from "@/lib/events";

type CommentWithReplies = CommentSelectSchema & {
  replies: CommentSelectSchema[];
};

type ActionType = "like" | "dislike";

interface LikeDislikeCommentProcedureParams {
  ee: IterableEventEmitter<{ update: [data: CommentWithReplies] }>;
  type: ActionType;
}

export const createLikeDislikeCommentProcedure = ({ ee, type }: LikeDislikeCommentProcedureParams) =>
  publicProcedure
    .input(
      z.object({
        commentId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(comments)
        .set({
          [type === "like" ? "likesCount" : "dislikesCount"]: sql`${
            type === "like" ? comments.likesCount : comments.dislikesCount
          } + 1`,
        })
        .where(eq(comments.id, input.commentId))
        .returning({ id: comments.id });

      if (!updated) {
        return null;
      }

      const comment = await ctx.db.query.comments.findFirst({
        where: eq(comments.id, updated.id),
        with: { replies: true },
      });

      if (comment) {
        ee.emit("update", comment);
      }

      return comment;
    });
