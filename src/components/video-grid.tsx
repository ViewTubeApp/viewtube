"use client";

import { motion } from "motion/react";
import { staggerContainer } from "@/constants/animations";
import { type Video } from "@/server/db/schema";
import { VideoCard } from "./video-card";
import { api } from "@/trpc/react";
import { useQueryState } from "nuqs";
import { LOAD_COUNT } from "@/constants/shared";

interface VideoGridProps {
  videos: Video[];
}

export function VideoGrid({ videos: initialVideos }: VideoGridProps) {
  const [query] = useQueryState("q");

  const { data: videos } = api.video.latest.useQuery({ count: LOAD_COUNT, query }, { initialData: initialVideos });

  // Subscribe to video processing updates
  // api.video.onProcessed.useSubscription(undefined, {
  //   onData: () => void utils.video.invalidate(),
  //   onError: (err: unknown) => console.error("Error in video processing subscription:", err),
  // });

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
