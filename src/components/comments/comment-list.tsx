"use client";

import { type FC } from "react";

import { type CommentListResponse } from "@/server/api/routers/comments";

import { cn } from "@/lib/utils";

import { Comment } from "./comment";

interface CommentListProps {
  className?: string;
  comments: CommentListResponse;
}

export const CommentList: FC<CommentListProps> = ({ className, comments }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </div>
  );
};
