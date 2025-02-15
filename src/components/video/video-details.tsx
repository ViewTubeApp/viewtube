"use client";

import * as m from "@/paraglide/messages";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { motion } from "motion/react";
import { type FC } from "react";

import { type APIVideoType } from "@/server/api/routers/video";

import { motions } from "@/constants/motion";

import { Button } from "../ui/button";
import { VideoCategories, VideoModels, VideoTags } from "./video-tags";
import { VideoViews } from "./video-views";

interface VideoDetailsProps {
  video: APIVideoType;
}

export const VideoDetails: FC<VideoDetailsProps> = ({ video }) => {
  const tags = video.videoTags.map(({ tag }) => tag);
  const categories = video.categoryVideos.map(({ category }) => category);
  const models = video.modelVideos.map(({ model }) => model);

  return (
    <motion.div {...motions.slide.y.in} className="space-y-4">
      <h1 className="text-xl font-bold md:text-2xl">{video.title}</h1>
      <div className="flex flex-wrap gap-1">
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
          <div className="flex items-center rounded-full bg-secondary">
            <Button variant="ghost" size="sm" className="rounded-l-full px-4">
              <ThumbsUp className="mr-2 h-4 w-4" />
              {m.like()}
            </Button>
            <div className="h-6 w-[1px] bg-gray-600"></div>
            <Button variant="ghost" size="sm" className="rounded-r-full px-4">
              <ThumbsDown className="mr-2 h-4 w-4" />
            </Button>
          </div>
          {/* <Button variant="secondary" size="sm" className="col-span-1 flex-1 rounded-full sm:flex-initial">
            <Share2 className="h-4 w-4" />
            <span className="inline sm:hidden xl:inline">Share</span>
          </Button> */}
          {/* <Button variant="destructive" size="sm" className="col-span-1 flex-1 rounded-full sm:flex-initial">
            <Flag className="h-4 w-4" />
            <span className="inline sm:hidden xl:inline">Report</span>
          </Button> */}
        </div>
      </div>

      {video.description && (
        <div className="mt-4 rounded-lg bg-card p-2 sm:p-4">
          <p className="text-sm text-muted-foreground">{video.description}</p>
        </div>
      )}
    </motion.div>
  );
};
