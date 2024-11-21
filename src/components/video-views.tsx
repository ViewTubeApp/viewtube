"use client";

import { formatDistance } from "date-fns/formatDistance";

interface VideoViewsProps {
  views: number;
  timestamp: Date;
}

export function VideoViews({ views, timestamp }: VideoViewsProps) {
  return (
    <p className="text-xs text-muted-foreground md:text-sm">
      {views} views •{" "}
      {formatDistance(timestamp, new Date(), { addSuffix: true })}
    </p>
  );
}
