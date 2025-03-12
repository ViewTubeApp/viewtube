"use client";

import { api } from "@/trpc/react";
import * as motion from "motion/react-client";
import { useTranslations } from "next-intl";

import { motions } from "@/constants/motion";

import { Skeleton } from "../ui/skeleton";
import { RelatedVideoCard } from "./related-video-card";

interface RelatedVideosProps {
  videoId: number;
}

export function RelatedVideos({ videoId }: RelatedVideosProps) {
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
}

function RelatedVideosSkeleton() {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-2">
      <h2 className="mb-2 text-lg font-semibold">{t("related_videos")}</h2>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex gap-2">
            <Skeleton className="h-24 w-40 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-2/3 rounded-lg" />
              <Skeleton className="h-4 w-3/4 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

RelatedVideos.Skeleton = RelatedVideosSkeleton;
