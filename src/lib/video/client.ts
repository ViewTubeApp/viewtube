import { env } from "@/env";
import { createUrlBuilder } from "./shared";

export function getClientVideoUrls() {
  return createUrlBuilder(env.NEXT_PUBLIC_CDN_URL);
}

export const formatVideoDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${remainingMinutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  return `${remainingMinutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};
