"use client";

import * as motion from "motion/react-client";
import { useTranslations } from "next-intl";

import { type VideoListElement } from "@/server/api/routers/video";

import { motions } from "@/constants/motion";

import { RelatedVideoCard } from "./related-video-card";

interface RelatedVideosProps {
  videos: VideoListElement[];
}

export function RelatedVideos({ videos }: RelatedVideosProps) {
  const t = useTranslations();

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
}
