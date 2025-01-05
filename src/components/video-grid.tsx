"use client";

import { useInfiniteQueryObserver } from "@/hooks/use-infinite-query-observer";
import { api } from "@/trpc/react";
import { getNextPageParam } from "@/utils/react/query";
import { motion } from "motion/react";
import { parseAsString, useQueryState } from "nuqs";
import { type FC } from "react";

import { type GetVideoListSchema, type VideoListResponse } from "@/server/api/routers/video";

import { motions } from "@/constants/motion";

import { VideoCard } from "./video-card";

interface VideoGridProps {
  input: GetVideoListSchema;
  videos: VideoListResponse;
}

export const VideoGrid: FC<VideoGridProps> = ({ input, videos: initialData }) => {
  const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));

  const query = api.video.getVideoList.useInfiniteQuery(
    { ...input, query: searchQuery },
    { initialData: { pages: [initialData], pageParams: [] }, getNextPageParam },
  );

  const { ref } = useInfiniteQueryObserver(query);

  return (
    <motion.div {...motions.fade.in} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {query.data?.pages.flatMap((page) =>
        page.data.map((video) => <VideoCard key={video.id} video={video} ref={ref} />),
      )}
    </motion.div>
  );
};
