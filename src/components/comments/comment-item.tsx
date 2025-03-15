"use client";

import { useFormattedDistance } from "@/hooks/use-formatted-distance";
import { useLiveComment } from "@/hooks/use-live-comment";
import { api } from "@/trpc/react";
import { useTranslations } from "next-intl";
import { type FC } from "react";

import { type CommentListElement } from "@/server/api/routers/comments";

import { cn } from "@/lib/utils";

import { LikeButton } from "../like-button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";

interface CommentItemProps {
  className?: string;
  onReply?: () => void;
  comment: CommentListElement;
}

export const CommentItem: FC<CommentItemProps> = ({ comment, onReply, className }) => {
  const t = useTranslations();
  const formattedDistance = useFormattedDistance();

  useLiveComment({ videoId: comment.videoId });

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
          <div className="flex items-center">
            <LikeButton
              mode="like"
              variant="secondary"
              className="py-1 h-auto text-xs border-r border-foreground/10"
              iconClassName="size-3"
              hideLoader
              commentId={comment.id}
              count={comment.likesCount ?? 0}
              mutation={api.comments.likeComment}
            />
            <LikeButton
              mode="dislike"
              variant="secondary"
              className="py-1 h-auto text-xs"
              iconClassName="size-3"
              hideLoader
              commentId={comment.id}
              count={comment.dislikesCount ?? 0}
              mutation={api.comments.dislikeComment}
            />
          </div>
          <Button variant="ghost" className="rounded-full px-3 py-2 text-xs h-auto" onClick={onReply}>
            {t("reply")}
          </Button>
        </div>
      </div>
    </div>
  );
};
