"use client";

import { useVideoListQuery } from "@/queries/react/use-video-list.query";
import { motion } from "motion/react";
import { useQueryState } from "nuqs";
import { type FC } from "react";

import { type VideoListResponse } from "@/server/api/routers/video";

import { motions } from "@/constants/motion";
import { publicVideoListQueryOptions } from "@/constants/query";

import { VideoCard } from "./video-card";

interface VideoGridProps {
  videos: VideoListResponse;
}

export const VideoGrid: FC<VideoGridProps> = ({ videos: initialVideos }) => {
  const [query] = useQueryState("q");
  const { data: videos = [] } = useVideoListQuery({ ...publicVideoListQueryOptions, query }, initialVideos);

  return (
    <motion.div
      variants={motions.stagger.container}
      initial="hidden"
      animate="show"
      viewport={{ once: true }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </motion.div>
  );
};
