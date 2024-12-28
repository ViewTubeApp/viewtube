"use client";

import { useFormattedDistance } from "@/hooks/use-formatted-distance";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

interface VideoViewsProps {
  views: number;
  timestamp: Date;
  className?: string;
}

export function VideoViews({ views, timestamp, className }: VideoViewsProps) {
  const t = useTranslations("video.details");
  const formattedDistance = useFormattedDistance();

  return (
    <p className={cn("text-xs text-muted-foreground md:text-sm", className)}>
      {t("views", { count: views, date: formattedDistance(timestamp) })}
    </p>
  );
}
