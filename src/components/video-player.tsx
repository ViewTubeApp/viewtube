"use client";

import { motion } from "motion/react";
import { fadeIn } from "@/constants/animations";
import { type Video } from "@/server/db/schema";
import { MediaPlayer, MediaProvider, Poster } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";

import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import {
  getVideoFileUrl,
  getVideoPosterUrl,
  getVideoThumbnailsUrl,
} from "@/lib/video";

interface VideoPlayerProps {
  video: Video;
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  return (
    <motion.div {...fadeIn} className="relative w-full">
      <div className="relative overflow-hidden rounded-lg bg-card pt-[56.25%]">
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <MediaPlayer
            title={video.title}
            src={getVideoFileUrl(video.url)}
            playsInline
          >
            <MediaProvider>
              <Poster
                className="vds-poster"
                src={getVideoPosterUrl(video.url)}
                alt={video.title}
              />
            </MediaProvider>
            <DefaultVideoLayout
              icons={defaultLayoutIcons}
              thumbnails={getVideoThumbnailsUrl(video.url)}
            />
          </MediaPlayer>
        </div>
      </div>
    </motion.div>
  );
}
