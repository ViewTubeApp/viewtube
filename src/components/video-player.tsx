"use client";

import { motion } from "motion/react";
import { fadeIn } from "@/constants/animations";
import { type Video } from "@/server/db/schema";
import { MediaPlayer, MediaProvider, Poster } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";

import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { getClientVideoUrls } from "@/lib/video/client";
import { type FC, memo, type ReactNode } from "react";
import { log } from "@/lib/logger";

interface RichVideoPlayerProps {
  video: Video;
}

interface SimpleVideoPlayerProps {
  title: string;
  src: File | Blob;
}

type VideoPlayerProps = RichVideoPlayerProps | SimpleVideoPlayerProps;

export const VideoPlayer: FC<VideoPlayerProps> = memo((props) => {
  const { getVideoFileUrl, getVideoPosterUrl, getVideoThumbnailsUrl } = getClientVideoUrls();

  log.debug(props, { event: "VideoPlayer", hint: "props" });

  let content: ReactNode;

  if ("video" in props) {
    const { video } = props;

    content = (
      <MediaPlayer title={video.title} src={getVideoFileUrl(video.url)} playsInline logLevel="debug">
        <MediaProvider>
          <Poster className="vds-poster" src={getVideoPosterUrl(video.url)} alt={video.title} />
        </MediaProvider>
        <DefaultVideoLayout icons={defaultLayoutIcons} thumbnails={getVideoThumbnailsUrl(video.url)} />
      </MediaPlayer>
    );
  } else {
    const { src, title } = props;

    content = (
      <MediaPlayer title={title} src={{ src, type: "video/object" }} playsInline logLevel="debug">
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>
    );
  }

  return (
    <motion.div {...fadeIn} className="relative w-full">
      <div className="relative bg-card">{content}</div>
    </motion.div>
  );
});

VideoPlayer.displayName = "VideoPlayer";
