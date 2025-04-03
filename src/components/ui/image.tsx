"use client";

import { useMediaLoader } from "@/hooks/use-media-loader";
import NextImage, { type ImageProps as NextImageProps } from "next/image";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

import { MediaLoader } from "./media-loader";

type ImageProps = NextImageProps & { containerClassName?: string };

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt, className, containerClassName, ...imageProps }, ref) => {
    const { state, props: rest } = useMediaLoader();

    return (
      <div className={cn("relative size-full", containerClassName)}>
        <NextImage
          {...imageProps}
          src={src!}
          alt={alt!}
          className="object-cover absolute inset-0 blur-lg"
          ref={ref}
          {...rest}
        />
        <NextImage
          {...imageProps}
          {...rest}
          ref={ref}
          src={src!}
          alt={alt!}
          className={cn("size-full", className, { "opacity-0": state.isError })}
        />
        <MediaLoader {...state} />
      </div>
    );
  },
);

Image.displayName = "Image";
