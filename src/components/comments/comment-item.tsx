"use client";

import { useFormattedDistance } from "@/hooks/use-formatted-distance";
import { useLiveComment } from "@/hooks/use-live-comment";
import { api } from "@/trpc/react";
import { Flag, MoreVertical, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FC } from "react";

import { type CommentListElement } from "@/server/api/routers/comments";

import { cn } from "@/lib/utils";

import { IconButton } from "../icon-button";
import { LikeButton } from "../like-button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { TextExpander } from "../ui/text-expander";

interface CommentItemProps {
  className?: string;
  onReply?: () => void;
  comment: CommentListElement;
}

export const CommentItem: FC<CommentItemProps> = ({ comment, onReply, className }) => {
  const t = useTranslations();
  const formattedDistance = useFormattedDistance();

  useLiveComment({ videoId: comment.video_id });

  return (
    <div className={cn("flex gap-4", className)}>
      <Avatar>
        <AvatarFallback className="text-xs font-medium">
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
          <span className="text-xs text-gray-500">{formattedDistance(comment.created_at)}</span>
        </div>

        <div className="mt-1 text-sm text-foreground">
          <TextExpander lines={3}>{comment.content}</TextExpander>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center">
            <LikeButton
              mode="like"
              variant="secondary"
              className="py-1 h-auto text-xs border-r border-foreground/10"
              iconClassName="size-3"
              hideLoader
              commentId={comment.id}
              count={comment.likes_count ?? 0}
              mutation={api.comments.likeComment}
            />
            <LikeButton
              mode="dislike"
              variant="secondary"
              className="py-1 h-auto text-xs"
              iconClassName="size-3"
              hideLoader
              commentId={comment.id}
              count={comment.dislikes_count ?? 0}
              mutation={api.comments.dislikeComment}
            />
          </div>
          <Button variant="ghost" className="rounded-full px-3 py-2 text-xs h-auto" onClick={onReply}>
            {t("reply")}
          </Button>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton icon={MoreVertical} className="self-center" buttonClassName="size-8" iconClassName="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="space-y-2">
          <DropdownMenuItem className="text-yellow-500 cursor-pointer">
            <Flag className="size-4 stroke-yellow-500" />
            {t("report")}
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive cursor-pointer">
            <Trash className="size-4 stroke-destructive" />
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
