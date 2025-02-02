"use client";

import { api } from "@/trpc/react";
import { motion } from "motion/react";
import { parseAsString, useQueryState } from "nuqs";
import { type FC } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";

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
    {
      initialData: { pages: [initialData], pageParams: [] },
      getNextPageParam: (lastPage) => lastPage.data.at(-1)?.id,
    },
  );

  const [sentryRef] = useInfiniteScroll({
    loading: query.isLoading,
    hasNextPage: query.hasNextPage,
    disabled: query.isError,
    onLoadMore: () => query.fetchNextPage(),
  });

  return (
    <motion.div {...motions.fade.in} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {query.data?.pages.flatMap((page) => page.data.map((video) => <VideoCard key={video.id} video={video} />))}

      <div ref={sentryRef} className="h-1 w-full invisible" />
    </motion.div>
  );
};
