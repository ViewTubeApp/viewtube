"use client";

import { useMediaLoader } from "@/hooks/use-media-loader";
import { cn } from "@/utils/react/clsx";
import { getPublicURL } from "@/utils/react/video";
import { MediaPlayer, MediaProvider, Poster } from "@vidstack/react";
import { DefaultVideoLayout, defaultLayoutIcons } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/theme.css";
import * as motion from "motion/react-client";
import { type ReactNode, memo } from "react";

import { type VideoListElement } from "@/server/api/routers/video";

import { motions } from "@/constants/motion";

import { MediaLoader } from "../media-loader";

interface BaseVideoPlayerProps {
  className?: string;
}

interface RichVideoPlayerProps extends BaseVideoPlayerProps {
  video: VideoListElement;
}

interface SimpleVideoPlayerProps extends BaseVideoPlayerProps {
  title: string;
  src: string | File | Blob;
}

type VideoPlayerProps = RichVideoPlayerProps | SimpleVideoPlayerProps;

export const VideoPlayer = memo<VideoPlayerProps>((props) => {
  const { state, props: rest } = useMediaLoader();

  let content: ReactNode;

  if ("video" in props) {
    const { video } = props;
    const thumb = video.thumbnail_key ? getPublicURL(video.thumbnail_key) : undefined;

    content = (
      <MediaPlayer
        playsInline
        title={video.title}
        style={{ display: "block", aspectRatio: "16 / 9" }}
        src={getPublicURL(video.file_key)}
        {...rest}
      >
        <MediaProvider mediaProps={{ style: { aspectRatio: "16 / 9" } }}>
          <Poster className="vds-poster object-contain" src={thumb} alt={video.title} />
        </MediaProvider>
        <DefaultVideoLayout icons={defaultLayoutIcons} thumbnails={thumb} />
      </MediaPlayer>
    );
  } else {
    const { src, title } = props;
    const srcUrl = typeof src === "string" ? getPublicURL(src) : URL.createObjectURL(src);
    content = <video src={srcUrl} className="bg-black rounded-lg" controls title={title} ref={() => rest.onLoad()} />;
  }

  return (
    <motion.div {...motions.fade.in} className={cn("relative w-full", props.className)}>
      <div className={cn("relative", { "opacity-0": !state.isLoaded })}>{content}</div>
      <MediaLoader {...state} />
    </motion.div>
  );
});

VideoPlayer.displayName = "VideoPlayer";
