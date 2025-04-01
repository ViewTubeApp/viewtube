import { IterableEventEmitter } from "@/utils/server/events";

import { createTRPCRouter } from "@/server/api/trpc";
import { type CommentSelectSchema } from "@/server/db/schema";

import { createCreateCommentProcedure } from "./procedures/comments/create-comment";
import { createGetCommentsProcedure } from "./procedures/comments/get-comments";
import { createVoteCommentProcedure } from "./procedures/comments/vote-comment";
import { createOnCommentAddedSubscription } from "./subscriptions/comments/on-comment-added";
import { createOnCommentUpdatedSubscription } from "./subscriptions/comments/on-comment-updated";

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
  likeComment: createVoteCommentProcedure({ ee, type: "like" }),
  dislikeComment: createVoteCommentProcedure({ ee, type: "dislike" }),
  onCommentAdded: createOnCommentAddedSubscription({ ee }),
  onCommentUpdated: createOnCommentUpdatedSubscription({ ee }),
});

export type * from "./procedures/comments/create-comment";
export type * from "./procedures/comments/get-comments";
export type * from "./procedures/comments/vote-comment";
export type * from "./subscriptions/comments/on-comment-added";
export type * from "./subscriptions/comments/on-comment-updated";
