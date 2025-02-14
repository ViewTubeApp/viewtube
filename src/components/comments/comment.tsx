"use client";

import * as m from "@/paraglide/messages";
import { ChevronDown, ChevronUp } from "lucide-react";
import { type FC, useState } from "react";

import { type CommentResponse } from "@/server/api/routers/comments";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";
import { CommentItem } from "./comment-item";
import { NewComment } from "./new-comment";

interface CommentProps {
  parentId?: number;
  className?: string;
  comment: CommentResponse;
}

export const Comment: FC<CommentProps> = ({ comment, className, parentId }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const hasReplies = comment.replies && comment.replies.length > 0;

  const handleToggleReplies = () => {
    setShowReplyForm(false);
    setShowReplies((prev) => !prev);
  };

  return (
    <div className={cn("space-y-1", className)}>
      <CommentItem comment={comment} onReply={() => setShowReplyForm(true)} />

      {!hasReplies && showReplyForm && (
        <div className="mt-2 space-y-2 ml-12">
          <NewComment
            parentId={parentId ?? comment.id}
            videoId={comment.videoId}
            onCancel={() => setShowReplyForm(false)}
            onSubmit={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {hasReplies && (
        <>
          <Button
            variant="link"
            className="ml-10 flex items-center gap-1 px-3 py-2 h-auto text-sm font-medium text-blue-600"
            onClick={handleToggleReplies}
          >
            {showReplies ?
              <ChevronUp className="size-4" />
            : <ChevronDown className="size-4" />}
            {comment.replies.length === 1 ?
              m.reply_count_one({ count: comment.replies.length })
            : m.reply_count_many({ count: comment.replies.length })}
          </Button>

          {showReplies && (
            <div className="mt-2 space-y-2">
              {comment.replies.map((reply) => (
                <Comment parentId={comment.id} key={reply.id} comment={{ ...reply, replies: [] }} className="ml-12" />
              ))}
            </div>
          )}

          {showReplyForm && (
            <div className="mt-2 space-y-2 ml-12">
              <NewComment
                parentId={comment.id}
                videoId={comment.videoId}
                onCancel={() => setShowReplyForm(false)}
                onSubmit={() => setShowReplyForm(false)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
