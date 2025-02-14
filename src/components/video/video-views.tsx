"use client";

import { useFormattedDistance } from "@/hooks/use-formatted-distance";
import * as m from "@/paraglide/messages";
import { type FC } from "react";

import { cn } from "@/lib/utils";

interface VideoViewsProps {
  views: number;
  timestamp: Date;
  className?: string;
}

export const VideoViews: FC<VideoViewsProps> = ({ views, timestamp, className }) => {
  const formattedDistance = useFormattedDistance();

  return (
    <p className={cn("text-xs text-muted-foreground md:text-sm", className)}>
      {m.views_count_date({
        count: Intl.NumberFormat("en-US", { notation: "compact" }).format(views),
        date: formattedDistance(timestamp),
      })}
    </p>
  );
};
