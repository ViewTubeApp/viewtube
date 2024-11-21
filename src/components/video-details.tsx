"use client";

import { motion } from "motion/react";
import { ThumbsUp, ThumbsDown, Share2, Flag } from "lucide-react";
import { type Video } from "@/server/db/schema";
import { Button } from "./ui/button";
import { VideoViews } from "./video-views";

interface VideoDetailsProps {
  video: Video;
}

export function VideoDetails({ video }: VideoDetailsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 space-y-4"
    >
      <h1 className="text-xl font-bold md:text-2xl">{video.title}</h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <VideoViews views={video.viewsCount} timestamp={video.createdAt} />
          <Button className="w-full rounded-full sm:w-auto">Subscribe</Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
          <div className="flex items-center rounded-full bg-secondary">
            <Button variant="ghost" size="sm" className="rounded-l-full px-4">
              <ThumbsUp className="mr-2 h-4 w-4" />
              Like
            </Button>
            <div className="h-6 w-px bg-border"></div>
            <Button variant="ghost" size="sm" className="rounded-r-full px-4">
              <ThumbsDown className="mr-2 h-4 w-4" />
              Dislike
            </Button>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 rounded-full sm:flex-initial"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1 rounded-full sm:flex-initial"
          >
            <Flag className="h-4 w-4" />
            Report
          </Button>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-card">
        <p className="text-sm text-muted-foreground">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>
      </div>
    </motion.div>
  );
}
