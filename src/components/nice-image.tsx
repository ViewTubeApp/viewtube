import Image, { type ImageProps } from "next/image";
import { type ReactEventHandler, useCallback } from "react";

export function NiceImage(props: ImageProps) {
  const handleError: ReactEventHandler<HTMLImageElement> = useCallback((event) => {
    const image = event.target as HTMLImageElement;
    image.src = "https://placehold.co/640x360";
  }, []);

  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image {...props} onError={handleError} />;
}
