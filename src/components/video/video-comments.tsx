"use client";

import { useLiveComments } from "@/hooks/use-live-comments";
import { useTranslations } from "next-intl";
import { type FC } from "react";

import { type CommentListResponse } from "@/server/api/routers/comments";

import { CommentList } from "../comments/comment-list";
import { NewComment } from "../comments/new-comment";

interface VideoCommentsProps {
  videoId: number;
  comments: CommentListResponse;
}

export const VideoComments: FC<VideoCommentsProps> = ({ videoId, comments }) => {
  const t = useTranslations();

  useLiveComments({ videoId, initialData: comments });

  return (
    <>
      <h2 className="text-xl font-bold mb-6">
        {comments.length === 1 ?
          t("comments_count_one", { count: comments.length })
        : t("comments_count_many", { count: comments.length })}
      </h2>
      <NewComment videoId={videoId} />
      <CommentList comments={comments} />
    </>
  );
};
