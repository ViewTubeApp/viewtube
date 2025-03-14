"use client";

import { Link } from "@/i18n/navigation";
import { getPublicURL } from "@/utils/react/video";
import * as motion from "motion/react-client";
import { forwardRef } from "react";

import { type VideoListElement } from "@/server/api/routers/video";

import { Card } from "../ui/card";
import { VideoInfo } from "./video-info";
import { VideoPoster } from "./video-poster";

interface VideoCardProps {
  video: VideoListElement;
}

export const VideoCard = forwardRef<HTMLDivElement, VideoCardProps>(({ video }, ref) => {
  return (
    <Link href={`/videos/${video.id}`}>
      <motion.div ref={ref} whileHover={{ scale: 1.02 }}>
        <Card className="overflow-hidden border-0 bg-transparent p-0 gap-2">
          <VideoPoster
            duration={video.videoDuration}
            title={video.title}
            poster={getPublicURL(video.url).forType("poster")}
            trailer={getPublicURL(video.url).forType("trailer")}
          />
          <VideoInfo title={video.title} views={video.viewsCount} timestamp={video.createdAt} />
        </Card>
      </motion.div>
    </Link>
  );
});

VideoCard.displayName = "VideoCard";
