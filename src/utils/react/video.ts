import { env } from "@/env";

// Helper functions that use the CDN URL
export function createUrlBuilder(cdnUrl: string) {
  return {
    getVideoFileUrl: (url: string) => `${cdnUrl}/${url.substring(1)}`,
    getVideoPosterUrl: (url: string) => `${cdnUrl}/${getVideoDirectoryUrl(url)}/poster.jpg`,
    getVideoThumbnailsUrl: (url: string) => `${cdnUrl}/${getVideoDirectoryUrl(url)}/thumbnails.vtt`,
    getVideoStoryboardUrl: (url: string) => `${cdnUrl}/${getVideoDirectoryUrl(url)}/storyboard.jpg`,
    getVideoTrailerUrl: (url: string) => `${cdnUrl}/${getVideoDirectoryUrl(url)}/trailer.mp4`,
  } as const;
}

export function formatVideoDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${remainingMinutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  return `${remainingMinutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function getVideoDirectoryUrl(url: string) {
  return url.substring(1, url.lastIndexOf("/"));
}

export function getClientVideoUrls() {
  return createUrlBuilder(env.NEXT_PUBLIC_CDN_URL);
}
