import { run } from "@/utils/shared/run";
import { tracked } from "@trpc/server";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { type CommentSelectSchema, comments } from "@/server/db/schema";

import { type IterableEventEmitter } from "@/lib/events";

type CommentWithReplies = CommentSelectSchema & {
  replies: CommentSelectSchema[];
};

export const createOnCommentAddedSubscription = ({
  ee,
}: {
  ee: IterableEventEmitter<{
    add: [data: CommentWithReplies];
  }>;
}) =>
  publicProcedure
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
    });
