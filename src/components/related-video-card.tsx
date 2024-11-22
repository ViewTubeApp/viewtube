"use client";

import { type Video } from "@/server/db/schema";
import { motion } from "motion/react";
import Link from "next/link";
import { VideoViews } from "./video-views";
import { NiceImage } from "./nice-image";
import { staggerItem } from "@/constants/animations";

interface RelatedVideoCardProps {
  video: Video;
}

export function RelatedVideoCard({ video }: RelatedVideoCardProps) {
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
            src={video.thumbnail}
            alt={video.title}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex-1 flex-shrink-0">
          <h3 className="line-clamp-2 text-sm font-medium transition-colors group-hover:text-primary">
            {video.title}
          </h3>
          <VideoViews views={video.viewsCount} timestamp={video.createdAt} />
        </div>
      </motion.div>
    </Link>
  );
}
