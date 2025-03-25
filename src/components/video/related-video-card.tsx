"use client";

import { Link } from "@/i18n/navigation";
import { getPublicURL } from "@/utils/react/video";
import * as motion from "motion/react-client";
import { type FC } from "react";

import { type VideoListElement } from "@/server/api/routers/video";

import { NiceImage } from "../nice-image";
import { VideoDuration } from "./video-duration";
import { VideoViews } from "./video-views";

interface RelatedVideoCardProps {
  video: VideoListElement;
}

export const RelatedVideoCard: FC<RelatedVideoCardProps> = ({ video }) => {
  return (
    <Link href={`/videos/${video.id}`}>
      <motion.div whileHover={{ scale: 1.02 }} className="group flex cursor-pointer gap-2">
        <div className="relative aspect-video h-24 shrink-0 overflow-hidden rounded-lg sm:h-40 lg:h-24">
          <NiceImage
            fill
            src={getPublicURL(video.url).forType("poster")}
            alt={video.title}
            imageClassName="object-cover transition-transform group-hover:scale-105"
          />

          <div className="absolute bottom-0 left-0 right-0 flex justify-end p-1">
            <VideoDuration duration={video.video_duration} />
          </div>
        </div>
        <div className="flex-1 shrink-0">
          <h3 className="line-clamp-2 text-sm font-medium transition-colors group-hover:text-primary">{video.title}</h3>
          <VideoViews views={video.views_count} timestamp={video.created_at} />
        </div>
      </motion.div>
    </Link>
  );
};
