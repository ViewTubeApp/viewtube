"use client";

import { api } from "@/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import { FC } from "react";
import { toast } from "sonner";

import { VideoByIdResponse } from "@/server/api/routers/video";

import { Button } from "./ui/button";

interface LikeButtonProps {
  count: number;
  videoId: number;
  disabled?: boolean;
  mode: "like" | "dislike";
}

export const LikeButton: FC<LikeButtonProps> = ({ count, videoId, disabled, mode }) => {
  const queryClient = useQueryClient();

  const { mutate: likeVideo, isPending: isLikePending } = api.video.likeVideo.useMutation({
    onSuccess: () => {
      void queryClient.setQueryData(
        getQueryKey(api.video.getVideoById, { id: videoId }, "query"),
        (data: VideoByIdResponse) => ({
          ...data,
          likesCount: data.likesCount + 1,
          alreadyVoted: true,
        }),
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: dislikeVideo, isPending: isDislikePending } = api.video.dislikeVideo.useMutation({
    onSuccess: () => {
      void queryClient.setQueryData(
        getQueryKey(api.video.getVideoById, { id: videoId }, "query"),
        (data: VideoByIdResponse) => ({
          ...data,
          dislikesCount: data.dislikesCount + 1,
          alreadyVoted: true,
        }),
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const isPending = isLikePending || isDislikePending;

  const ThumbIcon = {
    like: ThumbsUp,
    dislike: ThumbsDown,
  }[mode];

  const handleClick = () => {
    const fn = {
      like: likeVideo,
      dislike: dislikeVideo,
    }[mode];

    fn({ videoId: videoId });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="rounded-l-full px-4"
      onClick={handleClick}
      disabled={isPending || disabled}
    >
      {isPending ?
        <Loader2 className="size-4 animate-spin" />
      : <ThumbIcon className="size-4" />}
      {count}
    </Button>
  );
};
