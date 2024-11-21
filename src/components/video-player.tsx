"use client";

import { motion } from "motion/react";
import { fadeIn } from "@/constants/animations";
import { type Video } from "@/server/db/schema";

interface VideoPlayerProps {
  video: Video;
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  return (
    <motion.div {...fadeIn} className="relative w-full">
      <div className="relative overflow-hidden rounded-lg bg-card pt-[56.25%]">
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <video src={video.url} className="h-full w-full" controls />
        </div>
      </div>
    </motion.div>
  );
}
