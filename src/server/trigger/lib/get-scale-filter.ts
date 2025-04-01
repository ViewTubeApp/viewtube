import { type TrailerConfig } from "../types";

/**
 * Get the appropriate scale filter based on video orientation and config
 */
export function getScaleFilter(width: number, height: number, config: TrailerConfig) {
  const strategy = config.aspectRatioStrategy;
  const orientation = height > width ? "portrait" : "landscape";

  // Default dimensions from config
  let targetWidth = config.width;
  let targetHeight = config.height;

  // Check if we need to adjust dimensions based on orientation
  if (orientation === "portrait") {
    // For portrait videos, we might want to swap dimensions or use different logic
    const maxWidth = config.maxWidth;
    const maxHeight = config.maxHeight;

    // Adjust target dimensions based on orientation while respecting max dimensions
    if (strategy === "fit") {
      // Calculate scaled dimensions while maintaining aspect ratio
      const aspectRatio = width / height;

      // Try scaling by height first
      const newWidth = Math.floor(maxHeight * aspectRatio);
      if (newWidth <= maxWidth) {
        // Height-constrained
        targetWidth = newWidth;
        targetHeight = maxHeight;
      } else {
        // Width-constrained
        targetWidth = maxWidth;
        targetHeight = Math.floor(maxWidth / aspectRatio);
      }
    }
  }

  if (strategy === "fit") {
    return `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2`;
  }

  if (strategy === "crop") {
    return `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=increase,crop=${targetWidth}:${targetHeight}`;
  }

  if (strategy === "stretch") {
    return `scale=${targetWidth}:${targetHeight}`;
  }

  return `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2`;
}
