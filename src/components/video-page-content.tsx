"use client";

import { motion } from "motion/react";
import { fadeIn } from "@/constants/animations";
import { type Video } from "@/server/db/schema";
import { RelatedVideos } from "./related-videos";
import { VideoDetails } from "./video-details";
import { VideoPlayer } from "./video-player";

interface VideoPageClientProps {
  video: Video;
  related: Video[];
}

export function VideoPageContent({ video, related }: VideoPageClientProps) {
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
