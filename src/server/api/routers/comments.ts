import { zAsyncIterable } from "@/utils/shared/zod";
import { type inferTransformedProcedureOutput, tracked } from "@trpc/server";
import { and, desc, eq, gt } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { type Comment, commentInsertSchema, commentSelectSchema, comments } from "@/server/db/schema";

import { IterableEventEmitter } from "@/lib/events";

export const ee = new IterableEventEmitter<{
  add: [data: Comment];
}>();

const getCommentsSchema = z.object({
  videoId: z.number(),
});

const onCommentAddedInputSchema = z.object({
  videoId: z.number(),
  lastEventId: z.number().nullish(),
});

const onCommentAddedOutputSchema = zAsyncIterable({
  tracked: true,
  yield: commentSelectSchema,
});

export const commentsRouter = createTRPCRouter({
  createComment: publicProcedure.input(commentInsertSchema).mutation(async ({ ctx, input }) => {
    const [comment] = await ctx.db.insert(comments).values(input).returning();

    if (comment) {
      ee.emit("add", comment);
    }

    return comment;
  }),

  getComments: publicProcedure.input(getCommentsSchema).query(async ({ ctx, input }) => {
    return ctx.db.query.comments.findMany({
      with: { replies: true },
      where: eq(comments.videoId, input.videoId),
      orderBy: [desc(comments.createdAt)],
    });
  }),

  onCommentAdded: publicProcedure
    .input(onCommentAddedInputSchema)
    .output(onCommentAddedOutputSchema)
    .subscription(async function* ({ ctx, input, signal }) {
      const { videoId, lastEventId } = input;

      // Start listening for new comments immediately to avoid missing any
      const iterable = ee.toIterable("add", { signal });

      // Get the last comment's creation time if we have a lastEventId
      let lastCommentCreatedAt = await (async () => {
        if (!lastEventId) return null;
        const lastComment = await ctx.db.query.comments.findFirst({
          where: eq(comments.id, lastEventId),
        });
        return lastComment?.createdAt ?? null;
      })();

      // Get any comments we missed since the last event
      const missedComments = await ctx.db.query.comments.findMany({
        where:
          lastCommentCreatedAt ?
            and(eq(comments.videoId, videoId), gt(comments.createdAt, lastCommentCreatedAt))
          : eq(comments.videoId, videoId),
        with: { replies: true },
        orderBy: [desc(comments.createdAt)],
      });

      function* maybeYield(comment: Comment) {
        if (comment.videoId !== videoId) {
          // Ignore comments from other videos
          return;
        }
        if (lastCommentCreatedAt && comment.createdAt <= lastCommentCreatedAt) {
          // Ignore comments we've already sent
          return;
        }

        yield tracked(String(comment.id), comment);
        lastCommentCreatedAt = comment.createdAt;
      }

      // Yield any missed comments
      for (const comment of missedComments) {
        yield* maybeYield(comment);
      }

      // Listen for new comments
      for await (const [comment] of iterable) {
        yield* maybeYield(comment);
      }
    }),
});

export type CommentListResponse = inferTransformedProcedureOutput<
  typeof commentsRouter,
  typeof commentsRouter.getComments
>;

export type CommentResponse = CommentListResponse[number];
