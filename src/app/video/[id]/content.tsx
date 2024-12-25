"use client";

import { api } from "@/trpc/react";
import { motion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect } from "react";

import { type VideoExtended } from "@/server/db/schema";

import { motions } from "@/constants/motion";

interface VideoPageClientProps {
  video: VideoExtended;
  related: VideoExtended[];
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

export function VideoPageContent({ video, related }: VideoPageClientProps) {
  const utils = api.useUtils();

  useEffect(() => {
    void utils.video.invalidate();
  }, [utils]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <motion.div {...motions.fade.in} className="lg:col-span-2">
        <VideoPlayer video={video} />
        <VideoDetails video={video} />
      </motion.div>
      <motion.div {...motions.fade.in}>
        <RelatedVideos videos={related} />
      </motion.div>
    </div>
  );
}
