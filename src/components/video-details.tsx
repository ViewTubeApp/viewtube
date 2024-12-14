"use client";

import { motion } from "motion/react";
import { ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { type VideoExtended } from "@/server/db/schema";
import { Button } from "./ui/button";
import dynamic from "next/dynamic";
import { VideoTags } from "./video-tags";

const VideoViews = dynamic(() => import("./video-views").then((mod) => mod.VideoViews), { ssr: false });

interface VideoDetailsProps {
  video: VideoExtended;
}

export function VideoDetails({ video }: VideoDetailsProps) {
  const tags = video.videoTags.map(({ tag }) => tag.name);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
      <h1 className="text-xl font-bold md:text-2xl">{video.title}</h1>
      <VideoTags tags={tags} />

      <div className="grid grid-cols-[min-content_1fr_1fr] grid-rows-2 gap-2 gap-y-4 sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-x-4">
        <div className="contents items-center gap-4 sm:flex">
          <VideoViews views={video.viewsCount} timestamp={video.createdAt} />
          {/* <Button className="col-span-2 w-full rounded-full sm:w-auto">Subscribe</Button> */}
        </div>

        <div className="contents flex-wrap gap-2 sm:flex">
          <div className="col-span-1 flex items-center rounded-full bg-secondary">
            <Button variant="ghost" size="sm" className="rounded-l-full px-4">
              <ThumbsUp className="mr-2 h-4 w-4" />
              Like
            </Button>
            <div className="h-6 w-[1px] bg-gray-600"></div>
            <Button variant="ghost" size="sm" className="rounded-r-full px-4">
              <ThumbsDown className="mr-2 h-4 w-4" />
            </Button>
          </div>
          <Button variant="secondary" size="sm" className="col-span-1 flex-1 rounded-full sm:flex-initial">
            <Share2 className="h-4 w-4" />
            <span className="inline sm:hidden xl:inline">Share</span>
          </Button>
          {/* <Button variant="destructive" size="sm" className="col-span-1 flex-1 rounded-full sm:flex-initial">
            <Flag className="h-4 w-4" />
            <span className="inline sm:hidden xl:inline">Report</span>
          </Button> */}
        </div>
      </div>

      {video.description && (
        <div className="mt-4 rounded-lg bg-card">
          <p className="text-sm text-muted-foreground">{video.description}</p>
        </div>
      )}
    </motion.div>
  );
}
