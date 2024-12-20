"use client";

import { formatDistance } from "date-fns/formatDistance";

import { cn } from "@/lib/utils";

interface VideoViewsProps {
  views: number;
  timestamp: Date;
  className?: string;
}

export function VideoViews({ views, timestamp, className }: VideoViewsProps) {
  return (
    <p className={cn("text-xs text-muted-foreground md:text-sm", className)}>
      {views} views • {formatDistance(timestamp, new Date(), { addSuffix: true })}
    </p>
  );
}
