"use client";

import { api } from "@/trpc/react";
import * as motion from "motion/react-client";
import { parseAsString, useQueryState } from "nuqs";
import { type FC, type PropsWithChildren } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";

import { type GetVideoListSchema, type VideoListResponse } from "@/server/api/routers/video";

import { cn } from "@/lib/utils";

import { motions } from "@/constants/motion";

import { VideoCard } from "@/components/video/video-card";

type VideoGridProps = PropsWithChildren<{
  delay?: number;
  horizontal?: boolean;
  input: GetVideoListSchema;
  videos: VideoListResponse;
}>;

export const VideoGrid: FC<VideoGridProps> = ({ input, videos: initialData, children, delay = 0, horizontal }) => {
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
    disabled: query.isError || horizontal,
    onLoadMore: () => query.fetchNextPage(),
  });

  return (
    <div className="space-y-4">
      {children}

      <motion.div
        {...motions.fade.in}
        transition={{ delay }}
        className={cn("gap-4", {
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4": !horizontal,
          "flex flex-nowrap overflow-x-auto overflow-y-clip": horizontal,
        })}
      >
        {query.data?.pages
          .flatMap((page) => page.data)
          .map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              className={cn({
                "flex-[0_0_calc(100%)] sm:flex-[0_0_calc(50%-0.5rem)] lg:flex-[0_0_calc(33%-0.5rem)] xl:flex-[0_0_calc(25%-0.75rem)]":
                  horizontal,
              })}
            />
          ))}
        {!horizontal && <div ref={sentryRef} className="h-1 w-full invisible" />}
      </motion.div>
    </div>
  );
};
