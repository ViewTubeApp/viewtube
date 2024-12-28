"use client";

import { useVideoByIdQuery } from "@/queries/react/use-video-by-id.query";
import { getClientVideoUrls } from "@/utils/react/video";
import { motion } from "motion/react";
import dynamic from "next/dynamic";
import { memo } from "react";

import { type VideoByIdResponse } from "@/server/api/routers/video";

import { motions } from "@/constants/motion";

import { AmbientBackground } from "@/components/ambient-background";

interface VideoPageClientProps {
  id: string;
  video: VideoByIdResponse["video"];
  related: VideoByIdResponse["related"];
}

const VideoPlayer = dynamic(() => import("@/components/video-player").then((mod) => mod.VideoPlayer), {
  ssr: false,
});

const VideoDetails = dynamic(() => import("@/components/video-details").then((mod) => mod.VideoDetails), {
  ssr: false,
});

const RelatedVideos = dynamic(() => import("@/components/related-videos").then((mod) => mod.RelatedVideos), {
  ssr: false,
});

export const VideoPageContent = memo(({ id, video: initialVideo, related: initialRelated }: VideoPageClientProps) => {
  const initialData = { video: initialVideo, related: initialRelated };
  const { data } = useVideoByIdQuery({ id }, { initialData });

  const { getVideoPosterUrl } = getClientVideoUrls();

  if (!data?.video) {
    return null;
  }

  const { video, related = [] } = data;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 ">
      <motion.div {...motions.fade.in} className="lg:col-span-2">
        <VideoPlayer video={video} />
        <VideoDetails video={video} />
      </motion.div>
      <motion.div {...motions.fade.in}>
        <RelatedVideos videos={related} />
      </motion.div>

      <AmbientBackground src={getVideoPosterUrl(video.url)} alt={video.title} />
    </div>
  );
});

VideoPageContent.displayName = "VideoPageContent";
