import { eq } from "drizzle-orm";

import { publicProcedure } from "@/server/api/trpc";
import { type CommentSelectSchema, commentInsertSchema, comments } from "@/server/db/schema";

import { type IterableEventEmitter } from "@/lib/events";

type CommentWithReplies = CommentSelectSchema & {
  replies: CommentSelectSchema[];
};

interface CreateCommentProcedureParams {
  ee: IterableEventEmitter<{ add: [data: CommentWithReplies] }>;
}

export const createCreateCommentProcedure = ({ ee }: CreateCommentProcedureParams) =>
  publicProcedure.input(commentInsertSchema).mutation(async ({ ctx, input }) => {
    const [inserted] = await ctx.db.insert(comments).values(input).returning();

    if (!inserted) {
      return null;
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
