"use client";

import { log as globalLog } from "@/utils/react/logger";
import { getPublicURL } from "@/utils/react/video";
import { MediaPlayer, MediaProvider, Poster } from "@vidstack/react";
import { DefaultVideoLayout, defaultLayoutIcons } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/theme.css";
import { motion } from "motion/react";
import { type FC, type ReactNode, memo } from "react";

import { type Video } from "@/server/db/schema";

import { motions } from "@/constants/motion";

interface RichVideoPlayerProps {
  video: Video;
}

interface SimpleVideoPlayerProps {
  title: string;
  src: File | Blob;
}

type VideoPlayerProps = RichVideoPlayerProps | SimpleVideoPlayerProps;

export const VideoPlayer: FC<VideoPlayerProps> = memo((props) => {
  const log = globalLog.withTag("VideoPlayer");
  log.debug(props);

  let content: ReactNode;

  if ("video" in props) {
    const { video } = props;

    content = (
      <MediaPlayer title={video.title} src={getPublicURL(video.url).forType("file")} playsInline logLevel="debug">
        <MediaProvider>
          <Poster className="vds-poster" src={getPublicURL(video.url).forType("poster")} alt={video.title} />
        </MediaProvider>
        <DefaultVideoLayout icons={defaultLayoutIcons} thumbnails={getPublicURL(video.url).forType("thumbnails")} />
      </MediaPlayer>
    );
  } else {
    const { src, title } = props;
    const srcUrl = URL.createObjectURL(src);
    content = <video src={srcUrl} controls title={title} />;
  }

  return (
    <motion.div {...motions.fade.in} className="relative w-full">
      <div className="relative bg-card">{content}</div>
    </motion.div>
  );
});

VideoPlayer.displayName = "VideoPlayer";
