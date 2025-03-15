"use client";

import { api } from "@/trpc/react";
import * as motion from "motion/react-client";
import { type FC } from "react";

import { type VideoByIdResponse } from "@/server/api/routers/video";

import { cn } from "@/lib/utils";

import { motions } from "@/constants/motion";

import { ClientShareButton } from "../client-share-button";
import { LikeButton } from "../like-button";
import { NoSSR } from "../no-ssr";
import { TextExpander } from "../text-expander";
import { VideoCategories, VideoModels, VideoTags } from "./video-tags";
import { VideoViews } from "./video-views";

interface VideoDetailsProps {
  className?: string;
  video: VideoByIdResponse;
}

export const VideoDetails: FC<VideoDetailsProps> = ({ video, className }) => {
  const tags = video.videoTags.map(({ tag }) => tag);
  const categories = video.categoryVideos.map(({ category }) => category);
  const models = video.modelVideos.map(({ model }) => model);

  return (
    <motion.div {...motions.slide.y.in} className={cn("space-y-1", className)}>
      <h1 className="text-xl font-bold md:text-2xl">{video.title}</h1>

      <div className="flex flex-wrap gap-1 empty:hidden">
        <VideoTags tags={tags} />
        <VideoCategories categories={categories} />
        <VideoModels models={models} />
      </div>

      <div className="flex items-center justify-between gap-2 gap-y-4 sm:gap-x-4">
        <div className="flex items-center gap-4">
          <VideoViews views={video.viewsCount} timestamp={video.createdAt} />
          {/* <Button className="col-span-2 w-full rounded-full sm:w-auto">Subscribe</Button> */}
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center rounded-full">
            <LikeButton
              mode="like"
              className="border-r border-border/20"
              videoId={video.id}
              count={video.likesCount}
              disabled={video.alreadyVoted}
              mutation={api.video.likeVideo}
            />
            <LikeButton
              mode="dislike"
              videoId={video.id}
              count={video.dislikesCount}
              disabled={video.alreadyVoted}
              mutation={api.video.dislikeVideo}
            />
          </div>
          <NoSSR>
            <ClientShareButton title={video.title} description={video.description} />
          </NoSSR>
          {/* <Button variant="destructive" size="sm" className="col-span-1 flex-1 rounded-full sm:flex-initial">
            <Flag className="size-4" />
            <span className="inline sm:hidden xl:inline">Report</span>
          </Button> */}
        </div>
      </div>

      {video.description && (
        <div className="mt-3">
          <TextExpander className="text-sm text-muted-foreground" lines={3}>
            {video.description}
          </TextExpander>
        </div>
      )}
    </motion.div>
  );
};
