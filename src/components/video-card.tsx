"use client";

import { getPublicURL } from "@/utils/react/video";
import { motion } from "motion/react";

import { type VideoResponse } from "@/server/api/routers/video";

import { Link } from "@/lib/i18n";

import { Card } from "./ui/card";
import { VideoInfo } from "./video-info";
import { VideoPoster } from "./video-poster";

interface VideoCardProps {
  video: VideoResponse;
}

export function VideoCard({ video }: VideoCardProps) {
  const tags = video.videoTags.map(({ tag }) => tag.name);

  return (
    <Link href={`/video/${video.id}`}>
      <motion.div whileHover={{ scale: 1.02 }}>
        <Card className="group overflow-hidden border-0 bg-card">
          <VideoPoster
            duration={video.videoDuration}
            title={video.title}
            poster={getPublicURL(video.url).forType("poster")}
            trailer={getPublicURL(video.url).forType("trailer")}
          />
          <VideoInfo title={video.title} views={video.viewsCount} timestamp={video.createdAt} tags={tags} />
        </Card>
      </motion.div>
    </Link>
  );
}
