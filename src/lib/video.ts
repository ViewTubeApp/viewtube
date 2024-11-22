function getVideoDirectoryUrl(url: string) {
  return url.substring(0, url.lastIndexOf("/"));
}

export function getVideoPosterUrl(url: string) {
  return `${getVideoDirectoryUrl(url)}/poster.jpg`;
}

export function getVideoThumbnailsUrl(url: string) {
  return `${getVideoDirectoryUrl(url)}/thumbnails.vtt`;
}

export function getVideoStoryboardUrl(url: string) {
  return `${getVideoDirectoryUrl(url)}/storyboard.jpg`;
}

export function getVideoTrailerUrl(url: string) {
  return `${getVideoDirectoryUrl(url)}/trailer.mp4`;
}
