"use client";

import { motion } from "motion/react";
import { staggerItem } from "@/constants/animations";
import Link from "next/link";
import { type Video } from "@/server/db/schema";
import { Card } from "./ui/card";
import { VideoInfo } from "./video-info";
import { VideoPoster } from "./video-poster";
import { getVideoPosterUrl } from "@/lib/video";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link href={`/video/${video.id}`}>
      <motion.div
        variants={staggerItem}
        initial="hidden"
        whileInView="show"
        whileHover={{ scale: 1.02 }}
      >
        <Card className="group overflow-hidden border-0 bg-card">
          <VideoPoster
            poster={getVideoPosterUrl(video.url)}
            title={video.title}
          />
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
