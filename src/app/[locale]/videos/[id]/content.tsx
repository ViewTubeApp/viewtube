"use client";

import { useLiveVideo } from "@/hooks/use-live-video";
import { api } from "@/trpc/react";
import * as motion from "motion/react-client";
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import { type FC, useEffect } from "react";
import { match } from "ts-pattern";

import type { GetVideoListSchema, VideoByIdResponse } from "@/server/api/routers/video";

import { motions } from "@/constants/motion";
import { filters } from "@/constants/query";

import { RelatedVideos } from "@/components/video/related-videos";
import { VideoComments } from "@/components/video/video-comments";
import { VideoDetails } from "@/components/video/video-details";
import { VideoPlayer } from "@/components/video/video-player";

interface VideoPageClientProps {
  id: number;
  video: VideoByIdResponse;
}

export const VideoPageContent: FC<VideoPageClientProps> = ({ id, video: initialVideo }) => {
  const utils = api.useUtils();

  const { data: video } = api.video.getVideoById.useQuery(
    { id },
    {
      staleTime: 0,
      initialData: initialVideo,
    },
  );

  useLiveVideo({ videoId: video.id });

  const [{ q: query, m: model, c: category, s: sort }] = useQueryStates({
    q: parseAsString,
    m: parseAsInteger,
    c: parseAsInteger,
    s: parseAsStringEnum(["new", "popular"]),
  });

  useEffect(() => {
    const defaultInput = match(sort)
      .with("new", () => filters.video.list.new)
      .with("popular", () => filters.video.list.popular)
      .otherwise(() => filters.video.list.public);

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
    <motion.div {...motions.fade.in} className="grid grid-cols-1 gap-4 lg:grid-cols-7">
      <div className="lg:col-span-5 space-y-2">
        <VideoPlayer video={video} />
        <VideoDetails className="mb-2" video={video} />
        <VideoComments videoId={video.id} />
      </div>

      <RelatedVideos videoId={video.id} className="lg:col-span-2" />
    </motion.div>
  );
};
