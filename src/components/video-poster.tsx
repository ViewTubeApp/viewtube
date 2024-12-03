"use client";

import { NiceImage } from "./nice-image";
import { useState } from "react";
import { cn } from "@/lib/clsx";

interface VideoThumbnailProps {
  poster: string;
  title: string;
  trailer: string;
}

export function VideoPoster({ poster, title, trailer }: VideoThumbnailProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative aspect-video overflow-hidden rounded-lg"
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
    </div>
  );
}
