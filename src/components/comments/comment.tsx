import * as m from "@/paraglide/messages";
import { ChevronDown, ChevronUp } from "lucide-react";
import { type FC, useState } from "react";

import { type CommentResponse } from "@/server/api/routers/comments";

import { Button } from "../ui/button";
import { CommentItem } from "./comment-item";

interface CommentProps {
  comment: CommentResponse;
}

export const Comment: FC<CommentProps> = ({ comment }) => {
  const [showReplies, setShowReplies] = useState(false);

  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className="space-y-1">
      <CommentItem comment={comment} />

      {hasReplies && (
        <>
          <Button
            variant="link"
            className="ml-10 flex items-center gap-1 px-3 py-2 h-auto text-sm font-medium text-blue-600"
            onClick={() => setShowReplies(!showReplies)}
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
                <CommentItem key={reply.id} comment={{ ...reply, replies: [] }} isReply />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
