"use client";

import { type FC } from "react";

import { cn } from "@/lib/utils";

import { VideoViews } from "./video-views";

interface VideoInfoProps {
  title: string;
  views: number;
  timestamp: Date;
  className?: string;
}

export const VideoInfo: FC<VideoInfoProps> = ({ title, views, timestamp, className }) => {
  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="line-clamp-2 text-sm font-semibold transition-colors group-hover:text-primary md:text-base">
        {title}
      </h3>
      <VideoViews views={views} timestamp={timestamp} />
    </div>
  );
};
