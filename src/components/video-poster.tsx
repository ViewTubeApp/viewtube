"use client";

import { PlayButton } from "./play-button";
import { NiceImage } from "./nice-image";

interface VideoThumbnailProps {
  poster: string;
  title: string;
}

export function VideoPoster({ poster, title }: VideoThumbnailProps) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg">
      <NiceImage
        src={poster}
        alt={title}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
      <PlayButton />
    </div>
  );
}
