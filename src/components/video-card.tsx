"use client";

import { motion } from "motion/react";
import { staggerItem } from "@/constants/animations";
import Link from "next/link";
import { type Video } from "@/server/db/schema";
import { Card } from "./ui/card";
import { VideoInfo } from "./video-info";
import { VideoPoster } from "./video-poster";
import { getClientVideoUrls } from "@/lib/video/client";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const { getVideoPosterUrl, getVideoTrailerUrl } = getClientVideoUrls();

  return (
    <Link href={`/video/${video.id}`}>
      <motion.div
        viewport={{ once: true }}
        variants={staggerItem}
        className="relative"
        initial="hidden"
        whileInView="show"
        whileHover={{ scale: 1.02 }}
      >
        <Card className="group overflow-hidden border-0 bg-card">
          <VideoPoster title={video.title} poster={getVideoPosterUrl(video.url)} trailer={getVideoTrailerUrl(video.url)} />
          <VideoInfo title={video.title} views={video.viewsCount} timestamp={video.createdAt} />
        </Card>
      </motion.div>
    </Link>
  );
}
