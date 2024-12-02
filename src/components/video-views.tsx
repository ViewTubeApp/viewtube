"use client";

import { formatDistance } from "date-fns/formatDistance";
import dynamic from "next/dynamic";

interface VideoViewsProps {
  views: number;
  timestamp: Date;
}

function BaseVideoViews({ views, timestamp }: VideoViewsProps) {
  return (
    <p className="text-xs text-muted-foreground md:text-sm">
      {views} views • {formatDistance(timestamp, new Date(), { addSuffix: true })}
    </p>
  );
}

export const VideoViews = dynamic(Promise.resolve(BaseVideoViews), {
  ssr: false,
});
