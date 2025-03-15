"use client";

import { api } from "@/trpc/react";
import * as motion from "motion/react-client";
import { useTranslations } from "next-intl";
import { memo } from "react";

import { motions } from "@/constants/motion";

import { RelatedVideoCard } from "./related-video-card";

interface RelatedVideosProps {
  videoId: number;
}

export const RelatedVideos = memo<RelatedVideosProps>(({ videoId }) => {
  const t = useTranslations();

  const [videos] = api.video.getRelatedVideoList.useSuspenseQuery({ id: videoId });

  return (
    <motion.div {...motions.fade.in} className="flex flex-col gap-2">
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
