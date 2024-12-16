"use client";

import { type VideoExtended } from "@/server/db/schema";
import { motion } from "motion/react";
import Link from "next/link";
import { VideoViews } from "./video-views";
import { NiceImage } from "./nice-image";
import { staggerItem } from "@/constants/motion";
import { getClientVideoUrls } from "@/lib/video/client";
import { VideoTags } from "./video-tags";
import { VideoDuration } from "./video-duration";

interface RelatedVideoCardProps {
  video: VideoExtended;
}

export function RelatedVideoCard({ video }: RelatedVideoCardProps) {
  const { getVideoPosterUrl } = getClientVideoUrls();

  const tags = video.videoTags.map((tag) => tag.tag.name);

  return (
    <Link href={`/video/${video.id}`}>
      <motion.div
        variants={staggerItem}
        initial="hidden"
        whileInView="show"
        whileHover={{ scale: 1.02 }}
        className="group flex cursor-pointer gap-2"
      >
        <div className="relative aspect-video h-24 flex-shrink-0 overflow-hidden rounded-lg sm:h-40 lg:h-24">
          <NiceImage
            fill
            src={getVideoPosterUrl(video.url)}
            alt={video.title}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute bottom-0 left-0 right-0 flex justify-end p-1">
            <VideoDuration duration={video.videoDuration} />
          </div>
        </div>
        <div className="flex-1 flex-shrink-0">
          <h3 className="line-clamp-2 text-sm font-medium transition-colors group-hover:text-primary">{video.title}</h3>
          <VideoViews views={video.viewsCount} timestamp={video.createdAt} />
          <VideoTags tags={tags} className="mt-2" />
        </div>
      </motion.div>
    </Link>
  );
}
