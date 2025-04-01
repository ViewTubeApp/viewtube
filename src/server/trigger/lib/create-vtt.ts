import { formatTime } from "@vidstack/react";
import { type Result, ResultAsync, err, ok } from "neverthrow";
import fs from "node:fs/promises";
import path from "node:path";
import { type UploadedFileData } from "uploadthing/types";

import { type VideoProcessingError } from "../types";
import { uploadFile } from "./upload-file";

/**
 * Create a VTT file
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

    content.push(
      `${formatTime(start)} --> ${formatTime(end)}`,
      `${sprite.ufsUrl}#xywh=${x},${y},${width},${height}`,
      "",
    );
  }

  {
    const result = await ResultAsync.fromPromise(fs.writeFile(output, content.join("\n")), (error) => ({
      type: "FILE_SYSTEM_ERROR" as const,
      message: `❌ Failed to write VTT file: ${error}`,
    }));

    if (result.isErr()) {
      return err(result.error);
    }
  }

  // Upload the VTT file to UploadThing
  const buffer = await ResultAsync.fromPromise(fs.readFile(output), (error) => ({
    type: "FILE_SYSTEM_ERROR" as const,
    message: `❌ Failed to read VTT file: ${error}`,
  }));

  if (buffer.isErr()) {
    return err(buffer.error);
  }

  const result = await uploadFile(buffer.value, name, "text/vtt");

  if (result.isErr()) {
    return err({ type: "FFMPEG_ERROR", message: `Failed to upload VTT file: ${result.error}` });
  }

  return ok(result.value);
}
