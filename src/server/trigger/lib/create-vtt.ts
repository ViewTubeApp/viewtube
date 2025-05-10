import { formatTime } from "@vidstack/react";
import { type Result, ResultAsync, err, ok } from "neverthrow";
import fs from "node:fs/promises";
import path from "node:path";
import { type UploadedFileData } from "uploadthing/types";

import { uploadFile } from "../../../lib/file/upload-file";
import { type VideoProcessingError } from "../types";

/**
 * Create a VTT file
 * @param dir - The directory to save the VTT file
 * @param id - The id of the video
 * @param duration - The duration of the video
 * @param thumbnails - The number of thumbnails in the sprite sheet
 * @param interval - The interval between frames
 * @param width - The width of the sprite sheet
 * @param height - The height of the sprite sheet
 * @param columns - The number of columns in the sprite sheet
 */
export async function createVttFile(
  dir: string,
  id: number,
  duration: number,
  thumbnails: number,
  interval: number,
  width: number,
  height: number,
  columns: number,
  sprite: UploadedFileData,
): Promise<Result<UploadedFileData, VideoProcessingError>> {
  const name = `thumbnails_${id}_${Date.now()}.vtt`;
  const output = path.join(dir, name);
  const content = ["WEBVTT", ""];

  // Create VTT cues for each thumbnail
  for (let i = 0; i < thumbnails; i++) {
    // Calculate start and end times for each cue
    const start = i * interval;
    const end = Math.min((i + 1) * interval, duration);

    const row = Math.floor(i / columns);
    const col = i % columns;
    const x = col * width;
    const y = row * height;

    const formatTimeOptions = {
      padHrs: true,
      padMins: true,
      showMs: true,
      showHrs: true,
    } as const;

    content.push(
      `${formatTime(start, formatTimeOptions)} --> ${formatTime(end, formatTimeOptions)}`,
      `${sprite.ufsUrl}#xywh=${x},${y},${width},${height}`,
      "",
    );
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
