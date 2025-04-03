"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { useReducedMotion } from "motion/react";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { LazyLoadComponent } from "react-lazy-load-image-component";

import { cn } from "@/lib/utils";

import { Image } from "../ui/image";
import { VideoDuration } from "./video-duration";

interface VideoThumbnailProps {
  title: string;
  poster: string;
  trailer?: string;
  duration?: number;
  className?: string;
}

export const VideoPoster: FC<VideoThumbnailProps> = ({ poster, title, trailer, duration, className }) => {
  const isMobile = useIsMobile();
  const [hovered, setHovered] = useState(false);

  const prefersReducedMotion = useReducedMotion();

  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startPlayback = useCallback(() => {
    if (prefersReducedMotion) {
      return;
    }

    setHovered(true);

    if (videoRef.current) {
      videoRef.current.currentTime = 1;
      const playPromise = videoRef.current.play();

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Ignore the error since it's expected when quickly hovering in/out
        });
      }
    }
  }, [prefersReducedMotion]);

  const clearPlayback = useCallback(() => {
    if (prefersReducedMotion) {
      return;
    }

    setHovered(false);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 1;
    }
  }, [prefersReducedMotion]);

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
      className={cn("relative flex justify-center isolate aspect-video overflow-hidden", className)}
      onMouseEnter={startPlayback}
      onMouseLeave={clearPlayback}
    >
      <LazyLoadComponent>
        <Image fill src={poster} alt={title} className="object-contain" />
      </LazyLoadComponent>

      <LazyLoadComponent>
        <video
          loop
          muted
          ref={videoRef}
          preload="none"
          src={trailer}
          poster={poster}
          playsInline
          disableRemotePlayback
          disablePictureInPicture
          autoPlay={false}
          controls={false}
          className={cn("absolute h-full object-contain z-10 opacity-0 transition-opacity", { "opacity-100": hovered })}
        />
      </LazyLoadComponent>

      {!!duration && (
        <div className="absolute z-20 bottom-0 left-0 right-0 flex justify-end p-2">
          <VideoDuration duration={duration} />
        </div>
      )}
    </div>
  );
};
