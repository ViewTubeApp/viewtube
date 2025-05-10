import { type Result, err, ok } from "neverthrow";

import { DEFAULT_WEBVTT_CONFIG } from "../config";
import { type VideoProcessingError, type WebVTTResult } from "../types";
import { createSpriteSheet } from "./create-spritesheet";
import { createVTT } from "./create-vtt";

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
  }

  const interval = duration / thumbnails;
  const rows = Math.ceil(thumbnails / columns);

  const spriteResult = await createSpriteSheet(file, dir, id, rows, columns, interval, width, height);
  if (spriteResult.isErr()) {
    return err(spriteResult.error);
  }

  const vttResult = await createVTT(dir, id, duration, interval, width, height, columns, spriteResult.value);
  if (vttResult.isErr()) {
    return err(vttResult.error);
  }

  return ok({
    thumbnails_vtt: vttResult.value,
    storyboard_image: spriteResult.value,
  });
}
