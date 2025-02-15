"use client";

import { useFormattedDistance } from "@/hooks/use-formatted-distance";
import { useLiveComment } from "@/hooks/use-live-comment";
import * as m from "@/paraglide/messages";
import { api } from "@/trpc/react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { type FC } from "react";

import { type CommentResponse } from "@/server/api/routers/comments";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";

interface CommentItemProps {
  className?: string;
  onReply?: () => void;
  comment: CommentResponse;
}

export const CommentItem: FC<CommentItemProps> = ({ comment: initialComment, onReply, className }) => {
  const formattedDistance = useFormattedDistance();

  const { comment } = useLiveComment({ videoId: initialComment.videoId, initialData: initialComment });

  const { mutate: likeComment } = api.comments.likeComment.useMutation();
  const { mutate: dislikeComment } = api.comments.dislikeComment.useMutation();

  return (
    <div className={cn("flex gap-4", className)}>
      <Avatar>
        <AvatarFallback>
          {comment.username
            .split(" ")
            .map((name) => name[0]?.toUpperCase() ?? "")
            .filter(Boolean)
            .slice(0, 2)
            .join("")}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{comment.username}</span>
          <span className="text-xs text-gray-500">{formattedDistance(comment.createdAt)}</span>
        </div>

        <p className="mt-1 text-sm text-foreground">{comment.content}</p>

        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              className="flex items-center gap-1 rounded-full px-3 py-2 h-auto"
              onClick={() => likeComment({ commentId: comment.id })}
            >
              <ThumbsUp className="size-3" />
              <span className="text-xs">{comment.likesCount}</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-1 rounded-full px-3 py-2 h-auto"
              onClick={() => dislikeComment({ commentId: comment.id })}
            >
              <ThumbsDown className="size-3" />
              <span className="text-xs">{comment.dislikesCount}</span>
            </Button>
          </div>
          <Button variant="ghost" className="rounded-full px-3 py-2 text-xs h-auto" onClick={onReply}>
            {m.reply()}
          </Button>
        </div>
      </div>
    </div>
  );
};
