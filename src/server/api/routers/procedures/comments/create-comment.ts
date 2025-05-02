import { type IterableEventEmitter } from "@/utils/server/events";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import { publicProcedure } from "@/server/api/trpc";
import { type CommentSelectSchema, commentInsertSchema, comments } from "@/server/db/schema";

type CommentWithReplies = CommentSelectSchema & {
  replies: CommentSelectSchema[];
};

interface CreateCommentProcedureParams {
  ee: IterableEventEmitter<{ add: [data: CommentWithReplies] }>;
}

export const createCreateCommentProcedure = ({ ee }: CreateCommentProcedureParams) =>
  publicProcedure.input(commentInsertSchema).mutation(async ({ ctx, input }) => {
    const [inserted] = await ctx.db.insert(comments).values(input).returning({ id: comments.id });

    if (!inserted?.id) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "error_failed_to_create_comment",
      });
    }

    // Query the comment with its replies before emitting
    const comment = await ctx.db.query.comments.findFirst({
      where: eq(comments.id, inserted.id),
      with: { replies: true },
    });

    if (comment) {
      ee.emit("add", comment);
    }

    return comment;
  });
