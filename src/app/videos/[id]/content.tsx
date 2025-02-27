"use client";

import { api } from "@/trpc/react";
import { getPublicURL } from "@/utils/react/video";
import { motion } from "motion/react";
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import { memo, useEffect } from "react";
import { match } from "ts-pattern";

import { type CommentListResponse } from "@/server/api/routers/comments";
import {
  type GetVideoListSchema,
  type RelatedVideosResponse,
  type VideoByIdResponse,
} from "@/server/api/routers/video";

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
  related: RelatedVideosResponse;
}

export const VideoPageContent = memo<VideoPageClientProps>(
  ({ id, video: initialVideo, related: initialRelated, comments }) => {
    const utils = api.useUtils();

    const initialData = { video: initialVideo, related: initialRelated };
    const { data } = api.video.getVideoById.useQuery({ id, related: true, shallow: true }, { initialData });

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

    if (!data?.video) {
      return null;
    }

    const { video, related = [] } = data;

    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 ">
        <motion.div {...motions.fade.in} className="lg:col-span-2 space-y-4">
          <VideoPlayer video={video} />
          <VideoDetails video={video} />
          <VideoComments videoId={video.id} comments={comments} />
        </motion.div>

        <motion.div {...motions.fade.in}>
          <RelatedVideos videos={related} />
        </motion.div>

        <AmbientBackground src={getPublicURL(video.url).forType("poster")} alt={video.title} />
      </div>
    );
  },
);

VideoPageContent.displayName = "VideoPageContent";
