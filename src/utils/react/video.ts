import { env } from "@/env";
import { match } from "ts-pattern";

export type PublicURL = "file" | "poster" | "thumbnails" | "storyboard" | "trailer";

export function formatVideoDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${remainingMinutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  return `${remainingMinutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function getPublicURL(url: string) {
  function getVideoDirectoryUrl(url: string) {
    return url.substring(1, url.lastIndexOf("/"));
  }

  return {
    forType: (type: PublicURL) => {
      return match(type)
        .with("file", () => `${env.NEXT_PUBLIC_CDN_URL}/${url.substring(1)}`)
        .with("poster", () => `${env.NEXT_PUBLIC_CDN_URL}/${getVideoDirectoryUrl(url)}/poster.jpg`)
        .with("thumbnails", () => `${env.NEXT_PUBLIC_CDN_URL}/${getVideoDirectoryUrl(url)}/thumbnails.vtt`)
        .with("storyboard", () => `${env.NEXT_PUBLIC_CDN_URL}/${getVideoDirectoryUrl(url)}/storyboard.jpg`)
        .with("trailer", () => `${env.NEXT_PUBLIC_CDN_URL}/${getVideoDirectoryUrl(url)}/trailer.mp4`)
        .exhaustive();
    },
  };
}
