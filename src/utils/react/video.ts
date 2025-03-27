import { env } from "@/env";

export type PublicURL = "file" | "poster" | "thumbnails" | "storyboard" | "trailer";

/**
 * Returns the duration of a video in the format of hours:minutes:seconds.
 */
export function formatVideoDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${remainingMinutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  return `${remainingMinutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Returns the public URL for a given key.
 * If the key is not provided, it returns a 404 image.
 */
export function getPublicURL(key?: string | null) {
  return `https://${env.NEXT_PUBLIC_UPLOADTHING_APP_ID}.ufs.sh/f/${key ?? "404"}`;
}
