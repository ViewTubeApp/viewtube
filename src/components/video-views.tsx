"use client";

import { cn } from "@/lib/utils";
import { formatDistance } from "date-fns/formatDistance";

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
