"use client";

import { NiceImage } from "./nice-image";
import { useState } from "react";
import { cn } from "@/lib/clsx";
import { VideoDuration } from "./video-duration";

interface VideoThumbnailProps {
  poster: string;
  title: string;
  trailer: string;
  duration?: number;
  className?: string;
}

export function VideoPoster({ poster, title, trailer, duration, className }: VideoThumbnailProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn("relative aspect-video overflow-hidden rounded", className)}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
      onTouchStartCapture={() => setHovered(true)}
    >
      <video
        preload="metadata"
        src={trailer}
        poster={poster}
        muted
        playsInline
        disableRemotePlayback
        disablePictureInPicture
        autoPlay
        loop
        controls={false}
        className={cn("invisible absolute inset-0 object-cover", { visible: hovered })}
      />

      <NiceImage
        priority
        src={poster}
        alt={title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className={cn("object-cover transition-transform duration-300 group-hover:scale-105", { invisible: hovered })}
      />

      {!!duration && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-end p-2">
          <VideoDuration duration={duration} />
        </div>
      )}
    </div>
  );
}
