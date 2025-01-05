import Image, { type ImageProps } from "next/image";
import { forwardRef, useState } from "react";

import { Skeleton } from "./ui/skeleton";

export const NiceImage = forwardRef<HTMLImageElement, ImageProps>((props, ref) => {
  const [isLoaded, setIsLoaded] = useState(false);

  if (!isLoaded) {
    return <Skeleton className="w-full h-full" />;
  }

  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image {...props} ref={ref} onLoad={() => setIsLoaded(true)} />;
});

NiceImage.displayName = "NiceImage";
