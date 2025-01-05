"use client";

import { useMediaLoader } from "@/hooks/use-media-loader";
import { getPublicURL } from "@/utils/react/video";
import { cn } from "@/utils/shared/clsx";
import { MediaPlayer, MediaProvider, Poster } from "@vidstack/react";
import { DefaultVideoLayout, defaultLayoutIcons } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/theme.css";
import { motion } from "motion/react";
import { type FC, type ReactNode, memo } from "react";

import { type Video } from "@/server/db/schema";

import { motions } from "@/constants/motion";

import { MediaLoader } from "./media-loader";

interface RichVideoPlayerProps {
  video: Video;
}

interface SimpleVideoPlayerProps {
  title: string;
  src: File | Blob;
}

type VideoPlayerProps = RichVideoPlayerProps | SimpleVideoPlayerProps;

export const VideoPlayer: FC<VideoPlayerProps> = memo((props) => {
  const { state: mediaLoaderState, props: mediaLoaderProps } = useMediaLoader();

  let content: ReactNode;

  if ("video" in props) {
    const { video } = props;

    content = (
      <MediaPlayer
        title={video.title}
        src={getPublicURL(video.url).forType("file")}
        playsInline
        logLevel="debug"
        {...mediaLoaderProps}
      >
        <MediaProvider>
          <Poster className="vds-poster" src={getPublicURL(video.url).forType("poster")} alt={video.title} />
        </MediaProvider>
        <DefaultVideoLayout icons={defaultLayoutIcons} thumbnails={getPublicURL(video.url).forType("thumbnails")} />
      </MediaPlayer>
    );
  } else {
    const { src, title } = props;
    const srcUrl = URL.createObjectURL(src);
    content = <video src={srcUrl} controls title={title} ref={() => mediaLoaderProps.onLoad()} />;
  }

  return (
    <motion.div {...motions.fade.in} className="relative w-full aspect-video">
      <div className={cn("relative bg-card", { "opacity-0": !mediaLoaderState.isLoaded })}>{content}</div>
      <MediaLoader {...mediaLoaderState} />
    </motion.div>
  );
});

VideoPlayer.displayName = "VideoPlayer";
