import { formatTime } from "@vidstack/react";
import { type Result, ResultAsync, err, ok } from "neverthrow";
import fs from "node:fs/promises";
import path from "node:path";
import { type UploadedFileData } from "uploadthing/types";

import { uploadFile } from "../../../lib/utapi/upload-file";
import { type VideoProcessingError } from "../types";

/**
 * Create a VTT file
 * @param dir - The directory to save the VTT file
 * @param id - The id of the video
 * @param duration - The duration of the video
 * @param interval - The interval between frames
 * @param width - The width of the sprite sheet
 * @param height - The height of the sprite sheet
 * @param columns - The number of columns in the sprite sheet
 */
export async function createVTT(
  dir: string,
  id: number,
  duration: number,
  interval: number,
  width: number,
  height: number,
  columns: number,
  sprite: UploadedFileData,
): Promise<Result<UploadedFileData, VideoProcessingError>> {
  const name = `thumbnails_${id}_${Date.now()}.vtt`;
  const output = path.join(dir, name);
  const content = ["WEBVTT", ""];

  const formatTimeOptions = {
    padHrs: true,
    padMins: true,
    showMs: true,
    showHrs: true,
  } as const;

  let currentTime = 0;
  let x = 0;
  let y = 0;

  for (let i = 0; i <= Math.floor(duration / interval) + 1; i++) {
    if (currentTime > duration) {
      break;
    }

    const startTime = formatTime(currentTime, formatTimeOptions);
    currentTime += interval;
    const endTime = formatTime(currentTime, formatTimeOptions);

    if (!startTime || !endTime) {
      return err({
        type: "FILE_SYSTEM_ERROR" as const,
        message: `Invalid VTT timestamp at index ${i}`,
      });
    }

    content.push(`${startTime} --> ${endTime}`, `${sprite.ufsUrl}#xywh=${x},${y},${width},${height}`, "");

    x += width;
    if (x > width * (columns - 1)) {
      y += height;
      x = 0;
    }
  }

  const writeResult = await ResultAsync.fromPromise(fs.writeFile(output, content.join("\n")), (error) => ({
    type: "FILE_SYSTEM_ERROR" as const,
    message: `Failed to write VTT file: ${error}`,
  }));

  if (writeResult.isErr()) {
    return err(writeResult.error);
  }

  const bufferResult = await ResultAsync.fromPromise(fs.readFile(output), (error) => ({
    type: "FILE_SYSTEM_ERROR" as const,
    message: `Failed to read VTT file: ${error}`,
  }));

  if (bufferResult.isErr()) {
    return err(bufferResult.error);
  }

  const uploadResult = await uploadFile(bufferResult.value, name, "text/vtt");
  if (uploadResult.isErr()) {
    return err(uploadResult.error);
  }

  return ok(uploadResult.value.data!);
}
