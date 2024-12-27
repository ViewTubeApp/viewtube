"use client";

import { motion } from "motion/react";

import { type VideoListResponse } from "@/server/api/routers/video";

import { motions } from "@/constants/motion";

import { RelatedVideoCard } from "./related-video-card";

interface RelatedVideosProps {
  videos: VideoListResponse;
}

export function RelatedVideos({ videos }: RelatedVideosProps) {
  return (
    <motion.div variants={motions.stagger.container} initial="hidden" animate="show" className="flex flex-col gap-2">
      <h2 className="mb-2 text-lg font-semibold">Related Videos</h2>
      <div className="flex flex-col gap-3">
        {videos.map((video) => (
          <RelatedVideoCard key={video.id} video={video} />
        ))}
      </div>
    </motion.div>
  );
}
