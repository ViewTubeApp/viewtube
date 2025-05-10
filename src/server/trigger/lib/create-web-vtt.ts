import { logger } from "@trigger.dev/sdk/v3";
import { type Result, err, ok } from "neverthrow";

import { DEFAULT_WEBVTT_CONFIG } from "../config";
import { type VideoProcessingError, type WebVTTResult } from "../types";
import { createSpriteSheet } from "./create-spritesheet";
import { createVttFile } from "./create-vtt";

/**
 * Create WebVTT storyboard (thumbnails and VTT file)
 * @param file - The path to the video file
 * @param dir - The directory to save the thumbnails and VTT file
 * @param id - The id of the video
 * @param duration - The duration of the video
 * @param portrait - Whether the video is portrait
 * @returns The result of the WebVTT creation
 */
export async function createWebVTT(
  file: string,
  dir: string,
  id: number,
  duration: number,
  portrait: boolean,
): Promise<Result<WebVTTResult, VideoProcessingError>> {
  const config = { ...DEFAULT_WEBVTT_CONFIG };

  let { width, height } = config;
  const { columns, thumbnails } = config;

  if (portrait) {
    width = config.height;
    height = config.width;
    logger.debug("🎥 Portrait video detected, swapping dimensions", { width, height });
  }

  // Calculate intervals based on total duration and desired thumbnail count
  const interval = duration / config.thumbnails;
  logger.debug("🎥 Calculated interval between thumbnails", {
    duration,
    interval,
    numThumbnails: config.thumbnails,
  });

  const rows = Math.ceil(thumbnails / columns);
  logger.debug("🎥 Storyboard dimensions", { rows, columns, thumbnails });

  const sprite = await createSpriteSheet(file, dir, id, rows, columns, interval, thumbnails, width, height);
  if (sprite.isErr()) return err(sprite.error);

  const vtt = await createVttFile(dir, id, duration, thumbnails, interval, width, height, columns, sprite.value);
  if (vtt.isErr()) return err(vtt.error);

  return ok({
    thumbnails_vtt: vtt.value,
    storyboard_image: sprite.value,
  });
}
