/**
 * Loads an image from the specified URL
 *
 * @param src URL of the image to load
 * @returns Promise that resolves with an HTMLImageElement on successful loading
 */
export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (...args) => reject(args);
    img.src = src;
  });
}
