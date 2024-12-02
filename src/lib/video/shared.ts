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

function getVideoDirectoryUrl(url: string) {
  return url.substring(1, url.lastIndexOf("/"));
}
