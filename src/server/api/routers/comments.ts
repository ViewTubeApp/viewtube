import { createTRPCRouter } from "@/server/api/trpc";
import { type CommentSelectSchema } from "@/server/db/schema";

import { IterableEventEmitter } from "@/lib/events";

import { createCreateCommentProcedure } from "./procedures/comments/createComment";
import { createGetCommentsProcedure } from "./procedures/comments/getComments";
import { createLikeDislikeCommentProcedure } from "./procedures/comments/likeDislikeComment";
import { createOnCommentAddedSubscription } from "./subscriptions/comments/onCommentAdded";
import { createOnCommentUpdatedSubscription } from "./subscriptions/comments/onCommentUpdated";

type CommentWithReplies = CommentSelectSchema & {
  replies: CommentSelectSchema[];
};

export const ee = new IterableEventEmitter<{
  add: [data: CommentWithReplies];
  update: [data: CommentWithReplies];
}>();

export const commentsRouter = createTRPCRouter({
  createComment: createCreateCommentProcedure({ ee }),
  getComments: createGetCommentsProcedure(),
  likeComment: createLikeDislikeCommentProcedure({ ee, type: "like" }),
  dislikeComment: createLikeDislikeCommentProcedure({ ee, type: "dislike" }),
  onCommentAdded: createOnCommentAddedSubscription({ ee }),
  onCommentUpdated: createOnCommentUpdatedSubscription({ ee }),
});

export type * from "./procedures/comments/createComment";
export type * from "./procedures/comments/getComments";
export type * from "./procedures/comments/likeDislikeComment";
export type * from "./subscriptions/comments/onCommentAdded";
export type * from "./subscriptions/comments/onCommentUpdated";
