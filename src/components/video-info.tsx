"use client";

import { type FC } from "react";

import { VideoViews } from "./video-views";

interface VideoInfoProps {
  title: string;
  views: number;
  timestamp: Date;
}

export const VideoInfo: FC<VideoInfoProps> = ({ title, views, timestamp }) => {
  return (
    <div>
      <h3 className="line-clamp-2 text-sm font-semibold transition-colors group-hover:text-primary md:text-base">
        {title}
      </h3>
      <VideoViews className="mb-2" views={views} timestamp={timestamp} />
    </div>
  );
};
