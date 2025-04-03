"use client";

import { useStylePropertyValue } from "@/hooks/use-style-property-value";
import { type api } from "@/trpc/react";
import { logger } from "@/utils/react/logger";
import NumberFlow from "@number-flow/react";
import { Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ComponentProps } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { Button } from "./ui/button";
import { ClickSpark } from "./ui/click-spark";

type VideoMutation = typeof api.video.likeVideo | typeof api.video.dislikeVideo;
type CommentMutation = typeof api.comments.likeComment | typeof api.comments.dislikeComment;

interface VoteType {
  session_id: string;
  vote_type: "like" | "dislike";
}

interface BaseLikeButtonProps<T extends VideoMutation | CommentMutation> {
  count: number;
  className?: string;
  iconClassName?: string;
  disabled?: boolean;
  mode: "like" | "dislike";
  mutation: T;
  hideLoader?: boolean;
  vote?: VoteType;
  variant?: ComponentProps<typeof Button>["variant"];
}

interface VideoLikeButtonProps<T extends VideoMutation> extends BaseLikeButtonProps<T> {
  videoId: number;
  commentId?: never;
}

interface CommentLikeButtonProps<T extends CommentMutation> extends BaseLikeButtonProps<T> {
  videoId?: never;
  commentId: number;
}

const log = logger.withTag("user:video:vote");

export const LikeButton = ({
  mode,
  count,
  vote,
  disabled,
  className,
  hideLoader,
  iconClassName,
  variant = "default",
  ...props
}: VideoLikeButtonProps<VideoMutation> | CommentLikeButtonProps<CommentMutation>) => {
  const t = useTranslations();

  const { mutate, isPending } = props.mutation.useMutation({
    onError: (error) => {
      log.error("vote mutation error", error);
      toast.error(t(error.message));
    },
  });

  const ThumbIcon = {
    like: ThumbsUp,
    dislike: ThumbsDown,
  }[mode];

  const sparkColor = {
    like: useStylePropertyValue("--color-green-500"),
    dislike: useStylePropertyValue("--color-red-500"),
  }[mode];

  const isVoted = vote?.vote_type === mode;

  const handleClick = () => {
    if (isVoted) {
      return;
    }

    if (isVideoMutation(props)) {
      const fn = mutate as ReturnType<typeof props.mutation.useMutation>["mutate"];
      fn({ videoId: props.videoId });
    } else if (isCommentMutation(props)) {
      const fn = mutate as ReturnType<typeof props.mutation.useMutation>["mutate"];
      fn({ commentId: props.commentId });
    }
  };

  return (
    <ClickSpark sparkColor={sparkColor} disabled={isPending || disabled || isVoted}>
      <Button
        type="button"
        variant={variant}
        size="sm"
        className={cn("px-4", className, {
          "rounded-l-full": mode === "like",
          "rounded-r-full": mode === "dislike",
        })}
        onClick={handleClick}
        disabled={isPending || disabled}
      >
        {isPending && !hideLoader ?
          <Loader2 className={cn("size-4 animate-spin", iconClassName)} />
        : <ThumbIcon
            className={cn("size-4 transition-colors", iconClassName, {
              "fill-accent":
                (mode === "like" && vote?.vote_type === "like") ||
                (mode === "dislike" && vote?.vote_type === "dislike"),
            })}
          />
        }
        <NumberFlow value={count} />
      </Button>
    </ClickSpark>
  );
};

function isVideoMutation(props: unknown): props is VideoLikeButtonProps<VideoMutation> {
  return typeof props === "object" && props !== null && "videoId" in props;
}

function isCommentMutation(props: unknown): props is CommentLikeButtonProps<CommentMutation> {
  return typeof props === "object" && props !== null && "commentId" in props;
}
