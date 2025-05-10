"use client";

import { useMediaLoader } from "@/hooks/use-media-loader";
import { MediaPlayer, MediaProvider, Poster } from "@vidstack/react";
import { DefaultVideoLayout, defaultLayoutIcons } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/theme.css";
import * as motion from "motion/react-client";
import { type ReactNode, memo } from "react";

import { type VideoByIdResponse } from "@/server/api/routers/video";

import { cn } from "@/lib/utils";

import { motions } from "@/constants/motion";

import { MediaLoader } from "../ui/media-loader";

interface BaseVideoPlayerProps {
  className?: string;
}
interface RichVideoPlayerProps extends BaseVideoPlayerProps {
  video: VideoByIdResponse;
}

interface SimpleVideoPlayerProps extends BaseVideoPlayerProps {
  title?: string;
  src: string | File | Blob;
}

type VideoPlayerProps = RichVideoPlayerProps | SimpleVideoPlayerProps;

export const VideoPlayer = memo<VideoPlayerProps>((playerProps) => {
  const { state, props: mediaProps } = useMediaLoader();

  let content: ReactNode;

  if ("video" in playerProps) {
    const { video } = playerProps;
    const poster = video.poster_key ? video.signed_urls.poster_key : undefined;
    const thumbnails = video.thumbnail_key ? video.signed_urls.thumbnail_key : undefined;

    content = (
      <MediaPlayer
        autoPlay
        playsInline
        title={video.title}
        style={{ display: "block", aspectRatio: "16 / 9" }}
        src={{ src: video.signed_urls.file_key ?? "", type: "video/mp4" }}
      >
        <MediaProvider mediaProps={{ style: { aspectRatio: "16 / 9" } }}>
          <Poster className="vds-poster object-contain" src={poster} alt={video.title} />
        </MediaProvider>
        <DefaultVideoLayout icons={defaultLayoutIcons} thumbnails={thumbnails} />
      </MediaPlayer>
    );
  } else {
    const { src, title } = playerProps;
    const srcUrl = typeof src === "string" ? src : URL.createObjectURL(src);
    content = (
      <video src={srcUrl} className="bg-black rounded-lg" controls title={title} ref={() => mediaProps.onLoad()} />
    );
  }

  return (
    <motion.div {...motions.fade.in} className={cn("relative w-full", playerProps.className)}>
      <div className={cn("relative", { "opacity-0": !("video" in playerProps) && !state.isLoaded })}>{content}</div>
      {!("video" in playerProps) && <MediaLoader {...state} />}
    </motion.div>
  );
});

VideoPlayer.displayName = "VideoPlayer";
