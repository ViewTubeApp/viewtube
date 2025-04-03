"use client";

import { useMediaLoader } from "@/hooks/use-media-loader";
import { forwardRef } from "react";
import { LazyLoadImage, type LazyLoadImageProps } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

import { cn } from "@/lib/utils";

import { MediaLoader } from "./media-loader";

type LazyImageProps = LazyLoadImageProps & { containerClassName?: string };

export const LazyImage = forwardRef<HTMLDivElement, LazyImageProps>(
  ({ className, containerClassName, wrapperClassName, ...imageProps }, ref) => {
    const { state, props: mediaProps } = useMediaLoader();

    return (
      <div ref={ref} className={cn("relative size-full isolate", containerClassName)}>
        <LazyLoadImage {...imageProps} className="size-full z-0 object-cover absolute inset-0 blur-lg" />
        <LazyLoadImage
          {...imageProps}
          {...mediaProps}
          className={cn("size-full", className)}
          wrapperClassName={cn("size-full relative z-1", wrapperClassName, { "opacity-0": state.isError })}
        />
        <MediaLoader {...state} />
      </div>
    );
  },
);

LazyImage.displayName = "LazyImage";
