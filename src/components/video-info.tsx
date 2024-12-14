"use client";

import { VideoTags } from "./video-tags";
import { VideoViews } from "./video-views";

interface VideoInfoProps {
  title: string;
  views: number;
  tags: string[];
  timestamp: Date;
}

export function VideoInfo({ title, views, tags, timestamp }: VideoInfoProps) {
  return (
    <div>
      <h3 className="line-clamp-2 text-sm font-semibold transition-colors group-hover:text-primary md:text-base">{title}</h3>
      <VideoViews className="mb-2" views={views} timestamp={timestamp} />
      <VideoTags tags={tags} />
    </div>
  );
}
