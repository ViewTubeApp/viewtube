"use client";

import { motion } from "motion/react";
import { staggerContainer } from "@/constants/motion";
import { type VideoExtended } from "@/server/db/schema";
import { VideoCard } from "./video-card";
import { api } from "@/trpc/react";
import { useQueryState } from "nuqs";
import { GRID_QUERY_OPTIONS } from "@/constants/query";

interface VideoGridProps {
  videos: VideoExtended[];
}

export function VideoGrid({ videos: initialVideos }: VideoGridProps) {
  const [query] = useQueryState("q");

  const { data: videos } = api.video.getVideoList.useQuery({ ...GRID_QUERY_OPTIONS, query }, { initialData: initialVideos });

  return (
    <motion.div
      variants={staggerContainer}
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
}
