import ffmpeg from "fluent-ffmpeg";
import { type Result, ResultAsync, err, ok } from "neverthrow";
import fs from "node:fs/promises";
import path from "node:path";
import { type UploadedFileData } from "uploadthing/types";

import { uploadFile } from "../../../lib/file/upload-file";
import { FILE_TYPES, type VideoProcessingError } from "../types";

/**
 * Create a video poster (thumbnail)
 * @param file - The path to the video file
 * @param dir - The directory to save the poster file
 * @param id - The id of the video
 * @returns The result of the poster creation
 */
export async function createPoster(
  file: string,
  dir: string,
  id: number,
): Promise<Result<UploadedFileData, VideoProcessingError>> {
  const output = path.join(dir, `poster_${id}.jpg`);

  const promise = new Promise<void>((resolve, reject) => {
    ffmpeg(file)
      .screenshots({
        size: "640x?",
        timestamps: ["33%"],
        folder: path.dirname(output),
        filename: path.basename(output),
      })
      .on("end", () => resolve())
      .on("error", (err) => reject(err));
  });

  const ffmpegResult = await ResultAsync.fromPromise(promise, (error) => ({
    type: "FFMPEG_ERROR" as const,
    message: `Failed to create poster: ${error}`,
  }));

  if (ffmpegResult.isErr()) {
    return err(ffmpegResult.error);
  }

  const bufferResult = await ResultAsync.fromPromise(fs.readFile(output), (error) => ({
    type: "FILE_SYSTEM_ERROR" as const,
    message: `Failed to read poster file: ${error}`,
  }));

  if (bufferResult.isErr()) {
    return err(bufferResult.error);
  }

  const name = `poster_${id}_${Date.now()}.jpg`;
  const uploadResult = await uploadFile(bufferResult.value, name, FILE_TYPES.JPG);
  if (uploadResult.isErr()) {
    return err(uploadResult.error);
  }

  return ok(uploadResult.value.data!);
}
