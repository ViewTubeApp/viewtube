"use client";

import { getPublicURL } from "@/utils/react/video";
import { motion } from "motion/react";
import { forwardRef } from "react";

import { type VideoListElement } from "@/server/api/routers/video";

import { Link } from "@/lib/i18n";

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
        <Card className="group overflow-hidden border-0 bg-transparent space-y-2">
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
