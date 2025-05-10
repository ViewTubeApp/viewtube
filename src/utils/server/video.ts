import promiseAllProperties from "@/utils/promise";

import { getFileUrl } from "./utapi";

interface SignedUrls {
  file_key: string | null;
  poster_key: string | null;
  storyboard_key: string | null;
  thumbnail_key: string | null;
  trailer_key: string | null;
}

/**
 * Generate signed URLs for a video
 * @param video - The video to generate signed URLs for
 * @returns The signed URLs
 */
export function generateSignedUrls(video: SignedUrls) {
  return promiseAllProperties({
    file_key: video.file_key ? getFileUrl(video.file_key) : null,
    poster_key: video.poster_key ? getFileUrl(video.poster_key) : null,
    storyboard_key: video.storyboard_key ? getFileUrl(video.storyboard_key) : null,
    thumbnail_key: video.thumbnail_key ? getFileUrl(video.thumbnail_key) : null,
    trailer_key: video.trailer_key ? getFileUrl(video.trailer_key) : null,
  });
}
