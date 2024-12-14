"use client";

import { motion } from "motion/react";
import { fadeIn } from "@/constants/animations";
import dynamic from "next/dynamic";
import { api } from "@/trpc/react";
import { useEffect } from "react";
import { type VideoExtended } from "@/server/db/schema";

interface VideoPageClientProps {
  video: VideoExtended;
  related: VideoExtended[];
}

const VideoPlayer = dynamic(() => import("./video-player").then((mod) => mod.VideoPlayer), {
  ssr: false,
});

const VideoDetails = dynamic(() => import("./video-details").then((mod) => mod.VideoDetails), {
  ssr: false,
});

const RelatedVideos = dynamic(() => import("./related-videos").then((mod) => mod.RelatedVideos), {
  ssr: false,
});

export function VideoPageContent({ video, related }: VideoPageClientProps) {
  const utils = api.useUtils();

  useEffect(() => {
    void utils.video.invalidate();
  }, [utils]);

  return (
    <>
      <motion.div className="container mx-auto">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div {...fadeIn} className="lg:col-span-2">
            <VideoPlayer video={video} />
            <VideoDetails video={video} />
          </motion.div>
          <motion.div {...fadeIn}>
            <RelatedVideos videos={related} />
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
