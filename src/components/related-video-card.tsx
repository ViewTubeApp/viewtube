"use client";

import { type Video } from "@/server/db/schema";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { VideoViews } from "./video-views";

interface RelatedVideoCardProps {
  video: Video;
}

export function RelatedVideoCard({ video }: RelatedVideoCardProps) {
  return (
    <Link href={`/video/${video.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="group flex cursor-pointer gap-4"
      >
        <div className="relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-lg">
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex-1">
          <h3 className="line-clamp-2 text-sm font-medium transition-colors group-hover:text-primary">
            {video.title}
          </h3>
          <VideoViews views={video.viewsCount} timestamp={video.createdAt} />
        </div>
      </motion.div>
    </Link>
  );
}
