"use client";

import { motion } from "motion/react";
import { fadeInUp } from "@/constants/animations";
import Link from "next/link";
import { type Video } from "@/server/db/schema";
import { Card } from "./ui/card";
import { VideoInfo } from "./video-info";
import { VideoThumbnail } from "./video-thumbnail";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link href={`/video/${video.id}`}>
      <motion.div {...fadeInUp} whileHover={{ scale: 1.02 }}>
        <Card className="group overflow-hidden border-0 bg-card">
          <VideoThumbnail thumbnail={video.thumbnail} title={video.title} />
          <VideoInfo
            title={video.title}
            views={video.viewsCount}
            timestamp={video.createdAt}
          />
        </Card>
      </motion.div>
    </Link>
  );
}
