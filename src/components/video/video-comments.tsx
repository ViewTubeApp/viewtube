"use client";

import { useLiveComments } from "@/hooks/use-live-comments";
import * as m from "@/paraglide/messages";
import { type FC } from "react";

import { type APICommentListType } from "@/server/api/routers/comments";

import { CommentList } from "../comments/comment-list";
import { NewComment } from "../comments/new-comment";

interface VideoCommentsProps {
  videoId: number;
  comments: APICommentListType;
}

export const VideoComments: FC<VideoCommentsProps> = ({ videoId, comments: initialComments }) => {
  const { comments } = useLiveComments({ videoId, initialData: initialComments });

  return (
    <>
      <h2 className="text-xl font-bold mb-6">
        {comments.length === 1 ?
          m.comments_count_one({ count: comments.length })
        : m.comments_count_many({ count: comments.length })}
      </h2>
      <NewComment videoId={videoId} />
      <CommentList comments={comments} />
    </>
  );
};
