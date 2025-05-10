import ffmpeg from "fluent-ffmpeg";
import { type Result, ResultAsync, err, ok } from "neverthrow";
import fs from "node:fs/promises";
import path from "node:path";
import { type UploadedFileData } from "uploadthing/types";

import { uploadFile } from "../../../lib/utapi/upload-file";
import { FILE_TYPES, type VideoProcessingError } from "../types";

/**
 * Create a sprite sheet
 * @param file - The path to the video file
 * @param dir - The directory to save the sprite sheet
 * @param id - The id of the video
 * @param rows - The number of rows in the sprite sheet
 * @param columns - The number of columns in the sprite sheet
 * @param interval - The interval between frames
 * @param width - The width of the sprite sheet
 * @param height - The height of the sprite sheet
 * @returns The result of the sprite sheet creation
 */
export async function createSpriteSheet(
  file: string,
  dir: string,
  id: number,
  rows: number,
  columns: number,
  interval: number,
  width: number,
  height: number,
): Promise<Result<UploadedFileData, VideoProcessingError>> {
  const name = `storyboard_${id}_${Date.now()}.jpg`;
  const output = path.join(dir, name);

  const skipFrames = Math.round(interval * 30);
  const filterComplex = `select='not(mod(n,${skipFrames}))',scale=${width}:${height},tile=${columns}x${rows}`;

  const process = ffmpeg(file)
    .outputOptions(["-filter_complex", filterComplex, "-frames:v", "1", "-qscale:v", "3", "-an"])
    .output(output);

  const promise = new Promise<void>((resolve, reject) => {
    process
      .on("end", () => resolve())
      .on("error", (err) => reject(new Error(`Error creating sprite image: ${err.message}`)))
      .run();
  });

  const ffmpegResult = await ResultAsync.fromPromise(promise, (error) => ({
    type: "FFMPEG_ERROR" as const,
    message: `Failed to create sprite sheet: ${error}`,
  }));

  if (ffmpegResult.isErr()) {
    return err(ffmpegResult.error);
  }

  const bufferResult = await ResultAsync.fromPromise(fs.readFile(output), (error) => ({
    type: "READ_FILE_ERROR" as const,
    message: `Failed to read sprite sheet: ${error}`,
  }));

  if (bufferResult.isErr()) {
    return err(bufferResult.error);
  }

  const uploadResult = await uploadFile(bufferResult.value, name, FILE_TYPES.JPG);
  if (uploadResult.isErr()) {
    return err(uploadResult.error);
  }

  return ok(uploadResult.value.data!);
}
