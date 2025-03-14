"use client";

import { api } from "@/trpc/react";
import { getPublicURL } from "@/utils/react/video";
import * as motion from "motion/react-client";
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import { Suspense, memo, useEffect } from "react";
import { match } from "ts-pattern";

import { type CommentListResponse } from "@/server/api/routers/comments";
import type { GetVideoListSchema, VideoByIdResponse } from "@/server/api/routers/video";

import { motions } from "@/constants/motion";
import { publicVideoListQueryOptions } from "@/constants/query";
import { publicPopularVideoListQueryOptions } from "@/constants/query";
import { publicNewVideoListQueryOptions } from "@/constants/query";

import { AmbientBackground } from "@/components/ambient-background";
import { RelatedVideos } from "@/components/video/related-videos";
import { VideoComments } from "@/components/video/video-comments";
import { VideoDetails } from "@/components/video/video-details";
import { VideoPlayer } from "@/components/video/video-player";

interface VideoPageClientProps {
  id: number;
  comments: CommentListResponse;
  video: VideoByIdResponse;
}

export const VideoPageContent = memo<VideoPageClientProps>(({ id, video: initialVideo, comments: initialComments }) => {
  const utils = api.useUtils();

  const { data: video } = api.video.getVideoById.useQuery(
    { id },
    {
      staleTime: 0,
      initialData: initialVideo,
    },
  );

  const { data: comments } = api.comments.getComments.useQuery(
    { videoId: id },
    {
      staleTime: 0,
      initialData: initialComments,
    },
  );

  const [{ q: query, m: model, c: category, s: sort }] = useQueryStates({
    q: parseAsString,
    m: parseAsInteger,
    c: parseAsInteger,
    s: parseAsStringEnum(["new", "popular"]),
  });

  useEffect(() => {
    const defaultInput = match(sort)
      .with("new", () => publicNewVideoListQueryOptions)
      .with("popular", () => publicPopularVideoListQueryOptions)
      .otherwise(() => publicVideoListQueryOptions);

    const input: GetVideoListSchema = {
      ...defaultInput,
      query: query ?? undefined,
      model: model ?? undefined,
      category: category ?? undefined,
    };

    void Promise.resolve().then(async () => {
      await utils.video.getVideoList.invalidate();
      await utils.video.getVideoList.prefetchInfinite(input);
    });
  }, [utils, query, model, category, sort]);

  if (!video) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 ">
      <motion.div {...motions.fade.in} className="lg:col-span-2 space-y-2">
        <VideoPlayer video={video} />
        <VideoDetails video={video} />
        <VideoComments videoId={video.id} comments={comments} />
      </motion.div>

      <motion.div {...motions.fade.in}>
        <Suspense fallback={<RelatedVideos.Skeleton />}>
          <RelatedVideos videoId={video.id} />
        </Suspense>
      </motion.div>

      <AmbientBackground src={getPublicURL(video.url).forType("poster")} alt={video.title} />
    </div>
  );
});

VideoPageContent.displayName = "VideoPageContent";
