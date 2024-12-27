"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/utils/shared/clsx";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { NiceImage } from "./nice-image";
import { VideoDuration } from "./video-duration";

interface VideoThumbnailProps {
  poster: string;
  title: string;
  trailer: string;
  duration?: number;
  className?: string;
}

export const VideoPoster = memo(({ poster, title, trailer, duration, className }: VideoThumbnailProps) => {
  const isMobile = useIsMobile();
  const [hovered, setHovered] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startPlayback = useCallback(() => {
    setHovered(true);

    if (videoRef.current) {
      videoRef.current.currentTime = 1;
      void videoRef.current.play();
    }
  }, []);

  const clearPlayback = useCallback(() => {
    setHovered(false);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 1;
    }
  }, []);

  useEffect(() => {
    if (!isMobile) {
      clearPlayback();
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        startPlayback();
      } else {
        clearPlayback();
      }
    });

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [clearPlayback, startPlayback, isMobile]);

  return (
    <div
      ref={rootRef}
      className={cn("relative isolate aspect-video overflow-hidden rounded", className)}
      onMouseOver={startPlayback}
      onMouseOut={clearPlayback}
    >
      <NiceImage
        priority
        src={poster}
        alt={title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover transition-[opacity,transform] duration-300 group-hover:scale-105"
      />

      <video
        ref={videoRef}
        preload="metadata"
        src={trailer}
        poster={poster}
        muted
        playsInline
        disableRemotePlayback
        disablePictureInPicture
        autoPlay={false}
        loop
        controls={false}
        className={cn("absolute inset-0 z-10 object-cover opacity-0 transition-opacity duration-300", {
          "opacity-100": hovered,
        })}
      />

      {!!duration && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-end p-2">
          <VideoDuration duration={duration} />
        </div>
      )}
    </div>
  );
});

VideoPoster.displayName = "VideoPoster";
