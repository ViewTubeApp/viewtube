"use client";

import { Link } from "@/i18n/navigation";
import { getPublicURL } from "@/utils/react/video";
import * as motion from "motion/react-client";
import { forwardRef } from "react";

import { type VideoListElement } from "@/server/api/routers/video";

import { MagicCard } from "../magic-card";
import { VideoInfo } from "./video-info";
import { VideoPoster } from "./video-poster";

interface VideoCardProps {
  video: VideoListElement;
}

export const VideoCard = forwardRef<HTMLDivElement, VideoCardProps>(({ video }, ref) => {
  return (
    <Link href={`/videos/${video.id}`}>
      <motion.div ref={ref} whileHover={{ scale: 1.02 }} className="rounded-xl overflow-hidden h-full">
        <MagicCard className="size-full" childrenClassName="space-y-2">
          <VideoPoster
            className="mx-px translate-y-px rounded-t-xl"
            duration={video.video_duration}
            title={video.title}
            poster={getPublicURL(video.url).forType("poster")}
            trailer={getPublicURL(video.url).forType("trailer")}
          />
          <VideoInfo className="px-2 pb-2" title={video.title} views={video.views_count} timestamp={video.created_at} />
        </MagicCard>
      </motion.div>
    </Link>
  );
});

VideoCard.displayName = "VideoCard";
