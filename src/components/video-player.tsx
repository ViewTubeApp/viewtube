"use client";

import { motion } from "motion/react";
import { fadeIn } from "@/constants/animations";
import { type Video } from "@/server/db/schema";
import Image from "next/image";

interface VideoPlayerProps {
  video: Video;
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  return (
    <motion.div {...fadeIn} className="relative w-full">
      <div className="relative overflow-hidden rounded-lg bg-card pt-[56.25%]">
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          {/* Placeholder for actual video player */}
          <Image
            fill
            src={video.thumbnail}
            alt={video.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-primary"
            >
              <svg
                className="h-8 w-8 text-background"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
