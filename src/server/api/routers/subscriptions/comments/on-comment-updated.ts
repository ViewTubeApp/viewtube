import { type IterableEventEmitter } from "@/utils/server/events";
import { tracked } from "@trpc/server";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { type CommentSelectSchema } from "@/server/db/schema";

type CommentWithReplies = CommentSelectSchema & {
  replies: CommentSelectSchema[];
};

export const createOnCommentUpdatedSubscription = ({
  ee,
}: {
  ee: IterableEventEmitter<{
    update: [data: CommentWithReplies];
  }>;
}) =>
  publicProcedure
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
        if (comment.video_id === videoId) {
          // Only yield updates for comments from the specified video
          yield tracked(String(comment.id), comment);
        }
      }
    });
