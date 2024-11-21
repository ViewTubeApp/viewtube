"use client";

import { VideoViews } from "./video-views";

interface VideoInfoProps {
  title: string;
  views: number;
  timestamp: Date;
}

export function VideoInfo({ title, views, timestamp }: VideoInfoProps) {
  return (
    <div>
      <h3 className="line-clamp-2 text-sm font-semibold transition-colors group-hover:text-primary md:text-base">
        {title}
      </h3>
      <VideoViews views={views} timestamp={timestamp} />
    </div>
  );
}
