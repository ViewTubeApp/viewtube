"use client";

import { api } from "@/trpc/react";
import { motion } from "motion/react";
import { useQueryState } from "nuqs";

import { type VideoExtended } from "@/server/db/schema";

import { motions } from "@/constants/motion";
import { GRID_QUERY_OPTIONS } from "@/constants/query";

import { VideoCard } from "./video-card";

interface VideoGridProps {
  videos: VideoExtended[];
}

export function VideoGrid({ videos: initialVideos }: VideoGridProps) {
  const [query] = useQueryState("q");

  const { data: videos } = api.video.getVideoList.useQuery({ ...GRID_QUERY_OPTIONS, query }, { initialData: initialVideos });

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
}
