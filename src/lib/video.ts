function getVideoDirectoryUrl(url: string) {
  return url.substring(1, url.lastIndexOf("/"));
}

export function getVideoFileUrl(url: string) {
  return `/api/public/${url}`;
}

export function getVideoPosterUrl(url: string) {
  return `/api/public/${getVideoDirectoryUrl(url)}/poster.jpg`;
}

export function getVideoThumbnailsUrl(url: string) {
  return `/api/public/${getVideoDirectoryUrl(url)}/thumbnails.vtt`;
}

export function getVideoStoryboardUrl(url: string) {
  return `/api/public/${getVideoDirectoryUrl(url)}/storyboard.jpg`;
}

export function getVideoTrailerUrl(url: string) {
  return `/api/public/${getVideoDirectoryUrl(url)}/trailer.mp4`;
}
