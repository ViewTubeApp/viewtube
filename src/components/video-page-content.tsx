"use client";

import { motion } from "motion/react";
import { fadeIn } from "@/constants/animations";
import { type Video } from "@/server/db/schema";
import { RelatedVideos } from "./related-videos";
import { VideoDetails } from "./video-details";
import { VideoPlayer } from "./video-player";
import { useSidebarStore } from "@/lib/store/sidebar";

interface VideoPageClientProps {
  video: Video;
  related: Video[];
}

export function VideoPageContent({ video, related }: VideoPageClientProps) {
  const { isOpen } = useSidebarStore();

  return (
    <motion.div
      className="container mx-auto pb-6"
      animate={{
        paddingTop: isOpen ? 0 : "1.5rem",
        paddingInline: isOpen ? 0 : "1rem",
      }}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div {...fadeIn} className="lg:col-span-2">
          <VideoPlayer video={video} />
          <VideoDetails video={video} />
        </motion.div>
        <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
          <RelatedVideos videos={related} />
        </motion.div>
      </div>
    </motion.div>
  );
}
