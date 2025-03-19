"use client";

import { api } from "@/trpc/react";
import * as motion from "motion/react-client";
import { parseAsString, useQueryState } from "nuqs";
import { type FC, type PropsWithChildren } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";

import { type GetVideoListSchema, type VideoListResponse } from "@/server/api/routers/video";

import { motions } from "@/constants/motion";

import { VideoCard } from "@/components/video/video-card";

interface VideoGridProps {
  delayTransition?: boolean;
  input: GetVideoListSchema;
  videos: VideoListResponse;
}

export const VideoGrid: FC<PropsWithChildren<VideoGridProps>> = ({
  input,
  videos: initialData,
  children,
  delayTransition = true,
}) => {
  const [searchQuery] = useQueryState("q", parseAsString);

  const query = api.video.getVideoList.useInfiniteQuery(
    { ...input, query: searchQuery ?? undefined },
    {
      initialData: { pages: [initialData], pageParams: [] },
      getNextPageParam: (lastPage) => lastPage.meta.nextCursor,
    },
  );

  const [sentryRef] = useInfiniteScroll({
    loading: query.isLoading,
    hasNextPage: query.hasNextPage,
    disabled: query.isError,
    onLoadMore: () => query.fetchNextPage(),
  });

  return (
    <div className="space-y-4">
      {children}

      <motion.div
        {...motions.fade.in}
        transition={{ delay: delayTransition ? 0.3 : 0 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {query.data?.pages.flatMap((page) => page.data.map((video) => <VideoCard key={video.id} video={video} />))}
        <div ref={sentryRef} className="h-1 w-full invisible" />
      </motion.div>
    </div>
  );
};
