"use client";

import { useStylePropertyValue } from "@/hooks/useStylePropertyValue";
import { api } from "@/trpc/react";
import { Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import { type FC } from "react";
import { toast } from "sonner";

import { ClickSpark } from "./click-spark";
import { Button } from "./ui/button";

interface LikeButtonProps {
  count: number;
  videoId: number;
  disabled?: boolean;
  mode: "like" | "dislike";
}

export const LikeButton: FC<LikeButtonProps> = ({ count, videoId, disabled, mode }) => {
  const { mutate: likeVideo, isPending: isLikePending } = api.video.likeVideo.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: dislikeVideo, isPending: isDislikePending } = api.video.dislikeVideo.useMutation({
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

  const sparkColor = {
    like: useStylePropertyValue("--color-green-500"),
    dislike: useStylePropertyValue("--color-red-500"),
  }[mode];

  return (
    <ClickSpark sparkColor={sparkColor} disabled={isPending || disabled}>
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
    </ClickSpark>
  );
};
