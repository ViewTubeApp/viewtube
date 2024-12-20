"use client";

import { motion } from "motion/react";
import Link from "next/link";

import { type VideoExtended } from "@/server/db/schema";

import { getClientVideoUrls } from "@/lib/video/client";

import { motions } from "@/constants/motion";

import { Card } from "./ui/card";
import { VideoInfo } from "./video-info";
import { VideoPoster } from "./video-poster";

interface VideoCardProps {
  video: VideoExtended;
}

export function VideoCard({ video }: VideoCardProps) {
  const { getVideoPosterUrl, getVideoTrailerUrl } = getClientVideoUrls();

  const tags = video.videoTags.map(({ tag }) => tag.name);

  return (
    <Link href={`/video/${video.id}`}>
      <motion.div
        viewport={{ once: true }}
        variants={motions.stagger.item}
        className="relative"
        initial="hidden"
        whileInView="show"
        whileHover={{ scale: 1.02 }}
      >
        <Card className="group overflow-hidden border-0 bg-card">
          <VideoPoster
            duration={video.videoDuration}
            title={video.title}
            poster={getVideoPosterUrl(video.url)}
            trailer={getVideoTrailerUrl(video.url)}
          />
          <VideoInfo title={video.title} views={video.viewsCount} timestamp={video.createdAt} tags={tags} />
        </Card>
      </motion.div>
    </Link>
  );
}
