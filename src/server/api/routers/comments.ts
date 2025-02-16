import { run } from "@/utils/shared/run";
import { type inferTransformedProcedureOutput, tracked } from "@trpc/server";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { type DBCommentSchema, commentInsertSchema, comments } from "@/server/db/schema";

import { IterableEventEmitter } from "@/lib/events";

type CommentWithReplies = DBCommentSchema & {
  replies: DBCommentSchema[];
};

export const ee = new IterableEventEmitter<{
  add: [data: CommentWithReplies];
  update: [data: CommentWithReplies];
}>();

export const commentsRouter = createTRPCRouter({
  createComment: publicProcedure.input(commentInsertSchema).mutation(async ({ ctx, input }) => {
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
  }),

  getComments: publicProcedure
    .input(
      z.object({
        videoId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.comments.findMany({
        with: { replies: true },
        where: and(eq(comments.videoId, input.videoId), isNull(comments.parentId)),
        orderBy: [desc(comments.createdAt)],
      });
    }),

  likeComment: publicProcedure
    .input(
      z.object({
        commentId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(comments)
        .set({ likesCount: sql`${comments.likesCount} + 1` })
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
    }),

  dislikeComment: publicProcedure
    .input(
      z.object({
        commentId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(comments)
        .set({ dislikesCount: sql`${comments.dislikesCount} + 1` })
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
    }),

  onCommentAdded: publicProcedure
    .input(
      z.object({
        videoId: z.number(),
        lastEventId: z.number().nullish(),
      }),
    )
    .subscription(async function* ({ ctx, input, signal }) {
      const { videoId, lastEventId } = input;

      // Start listening for new comments immediately to avoid missing any
      const iterable = ee.toIterable("add", { signal });

      // Get the last comment's creation time if we have a lastEventId
      let lastCommentCreatedAt = await run(async () => {
        if (!lastEventId) {
          return null;
        }

        const lastComment = await ctx.db.query.comments.findFirst({
          with: { replies: true },
          where: eq(comments.id, lastEventId),
        });

        return lastComment?.createdAt ?? null;
      });

      // Get any comments we missed since the last event
      const missedComments = await ctx.db.query.comments.findMany({
        where:
          lastCommentCreatedAt ?
            and(eq(comments.videoId, videoId), gt(comments.createdAt, lastCommentCreatedAt), isNull(comments.parentId))
          : and(eq(comments.videoId, videoId), isNull(comments.parentId)),
        with: { replies: true },
        orderBy: [desc(comments.createdAt)],
      });

      async function* maybeYield(comment: CommentWithReplies) {
        if (comment.videoId !== videoId) {
          // Ignore comments from other videos
          return;
        }
        if (lastCommentCreatedAt && comment.createdAt <= lastCommentCreatedAt) {
          // Ignore comments we've already sent
          return;
        }

        // For replies, we need to check if the parent comment belongs to this video
        if (comment.parentId !== null) {
          const parent = await ctx.db.query.comments.findFirst({
            with: { replies: true },
            where: eq(comments.id, comment.parentId),
          });

          if (!parent || parent.videoId !== videoId) {
            // Ignore replies to comments from other videos
            return;
          }
        }

        // Load the comment with its replies before yielding
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

  onCommentUpdated: publicProcedure
    .input(
      z.object({
        videoId: z.number(),
        lastEventId: z.number().nullish(),
      }),
    )
    .subscription(async function* ({ input, signal }) {
      const { videoId } = input;

      // Start listening for comment updates
      const iterable = ee.toIterable("update", { signal });

      // Listen for updated comments
      for await (const [comment] of iterable) {
        if (comment.videoId === videoId) {
          // Only yield updates for comments from the specified video
          yield tracked(String(comment.id), comment);
        }
      }
    }),
});

export type APICommentListType = inferTransformedProcedureOutput<
  typeof commentsRouter,
  typeof commentsRouter.getComments
>;

export type APICommentType = APICommentListType[number];
