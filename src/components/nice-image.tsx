import { useMediaLoader } from "@/hooks/use-media-loader";
import { cn } from "@/utils/shared/clsx";
import Image, { type ImageProps } from "next/image";
import { forwardRef } from "react";

import { MediaLoader } from "./media-loader";

export const NiceImage = forwardRef<HTMLImageElement, ImageProps>(({ className, ...props }, ref) => {
  const { state: mediaLoaderState, props: mediaLoaderProps } = useMediaLoader();

  return (
    <div className={cn("relative size-full", className)}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image
        {...props}
        className={cn("size-full", { "opacity-0": mediaLoaderState.isError })}
        ref={ref}
        {...mediaLoaderProps}
      />
      <MediaLoader {...mediaLoaderState} />
    </div>
  );
});

NiceImage.displayName = "NiceImage";
