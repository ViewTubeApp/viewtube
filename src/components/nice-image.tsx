"use client";

import { useMediaLoader } from "@/hooks/use-media-loader";
import { cn } from "@/utils/react/clsx";
import Image, { type ImageProps } from "next/image";
import { forwardRef } from "react";

import { MediaLoader } from "./media-loader";

interface NiceImageProps extends ImageProps {
  imageClassName?: string;
}

export const NiceImage = forwardRef<HTMLImageElement, NiceImageProps>(
  ({ className, imageClassName, ...props }, ref) => {
    const { state, props: rest } = useMediaLoader();

    return (
      <div className={cn("relative size-full", className)}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image {...props} className="object-cover absolute inset-0 blur-lg" ref={ref} {...rest} />
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image
          {...props}
          className={cn("size-full", imageClassName, { "opacity-0": state.isError })}
          ref={ref}
          {...rest}
        />
        <MediaLoader {...state} />
      </div>
    );
  },
);

NiceImage.displayName = "NiceImage";
