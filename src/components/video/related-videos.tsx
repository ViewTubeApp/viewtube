"use client";

import { api } from "@/trpc/react";
import * as motion from "motion/react-client";
import { useTranslations } from "next-intl";
import { memo } from "react";

import { cn } from "@/lib/utils";

import { motions } from "@/constants/motion";

import { RelatedVideoCard } from "./related-video-card";
import { RelatedVideosSkeleton } from "./related-videos-skeleton";

interface RelatedVideosProps {
  videoId: number;
  className?: string;
}

export const RelatedVideos = memo<RelatedVideosProps>(({ videoId, className }) => {
  const t = useTranslations();

  const { data: videos = [], isLoading } = api.video.getRelatedVideoList.useQuery({ id: videoId });

  if (isLoading) {
    return <RelatedVideosSkeleton className={className} />;
  }

  return (
    <motion.div {...motions.fade.in} className={cn("flex flex-col gap-2", className)}>
      <h2 className="mb-2 text-lg font-semibold">{t("related_videos")}</h2>
      <div className="flex flex-col gap-3">
        {videos.map((video) => (
          <RelatedVideoCard key={video.id} video={video} />
        ))}
      </div>
    </motion.div>
  );
});

RelatedVideos.displayName = "RelatedVideos";
