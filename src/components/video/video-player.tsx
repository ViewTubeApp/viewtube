"use client";

import { useMediaLoader } from "@/hooks/use-media-loader";
import { getPublicURL } from "@/utils/react/video";
import { cn } from "@/utils/shared/clsx";
import { MediaPlayer, MediaProvider, Poster } from "@vidstack/react";
import { DefaultVideoLayout, defaultLayoutIcons } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/theme.css";
import * as motion from "motion/react-client";
import { type FC, type ReactNode, memo } from "react";

import { type VideoListElement } from "@/server/api/routers/video";

import { motions } from "@/constants/motion";

import { MediaLoader } from "../media-loader";

interface RichVideoPlayerProps {
  video: VideoListElement;
}

interface SimpleVideoPlayerProps {
  title: string;
  src: string | File | Blob;
}

type VideoPlayerProps = RichVideoPlayerProps | SimpleVideoPlayerProps;

export const VideoPlayer = memo<VideoPlayerProps>((props) => {
  const { state, props: rest } = useMediaLoader();

  let content: ReactNode;

  if ("video" in props) {
    const { video } = props;

    content = (
      <MediaPlayer
        playsInline
        title={video.title}
        style={{ display: "block", aspectRatio: "16 / 9" }}
        src={getPublicURL(video.url).forType("file")}
        {...rest}
      >
        <MediaProvider mediaProps={{ style: { aspectRatio: "16 / 9" } }}>
          <Poster
            className="vds-poster object-contain"
            src={getPublicURL(video.url).forType("poster")}
            alt={video.title}
          />
        </MediaProvider>
        <DefaultVideoLayout icons={defaultLayoutIcons} thumbnails={getPublicURL(video.url).forType("thumbnails")} />
      </MediaPlayer>
    );
  } else {
    const { src, title } = props;
    const srcUrl = typeof src === "string" ? getPublicURL(src).forType("file") : URL.createObjectURL(src);
    content = <video src={srcUrl} controls title={title} ref={() => rest.onLoad()} />;
  }

  return (
    <motion.div {...motions.fade.in} className="relative w-full">
      <div className={cn("relative", { "opacity-0": !state.isLoaded })}>{content}</div>
      <MediaLoader {...state} />
    </motion.div>
  );
});

VideoPlayer.displayName = "VideoPlayer";
