"use client";

import { useFormattedDistance } from "@/hooks/use-formatted-distance";
import * as m from "@/paraglide/messages";

import { cn } from "@/lib/utils";

interface VideoViewsProps {
  views: number;
  timestamp: Date;
  className?: string;
}

export function VideoViews({ views, timestamp, className }: VideoViewsProps) {
  const formattedDistance = useFormattedDistance();

  return (
    <p className={cn("text-xs text-muted-foreground md:text-sm", className)}>
      {m.views_count_date({ count: views, date: formattedDistance(timestamp) })}
    </p>
  );
}
