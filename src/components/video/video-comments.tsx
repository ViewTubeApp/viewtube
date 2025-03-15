"use client";

import { useLiveComments } from "@/hooks/use-live-comments";
import { api } from "@/trpc/react";
import { useTranslations } from "next-intl";
import { memo } from "react";

import { CommentList } from "../comments/comment-list";
import { NewComment } from "../comments/new-comment";

interface VideoCommentsProps {
  videoId: number;
}

export const VideoComments = memo<VideoCommentsProps>(({ videoId }) => {
  const t = useTranslations();

  const [comments] = api.comments.getComments.useSuspenseQuery(
    { videoId },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );

  useLiveComments({ videoId, comments });

  return (
    <>
      <h2 className="text-xl font-bold mb-4">
        {comments.length === 1 ?
          t("comments_count_one", { count: comments.length })
        : t("comments_count_many", { count: comments.length })}
      </h2>
      <NewComment className="mb-4" videoId={videoId} />
      <CommentList comments={comments} />
    </>
  );
});

VideoComments.displayName = "VideoComments";
