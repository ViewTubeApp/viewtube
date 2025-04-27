import ffmpeg from "fluent-ffmpeg";
import { type Result, ResultAsync, err } from "neverthrow";
import fs from "node:fs/promises";
import path from "node:path";
import { type UploadedFileData } from "uploadthing/types";

import { FILE_TYPES, type VideoProcessingError } from "../types";
import { uploadFile } from "./upload-file";

/**
 * Create a video poster (thumbnail)
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

  const result = await ResultAsync.fromPromise(promise, (error) => ({
    type: "FFMPEG_ERROR" as const,
    message: `❌ Failed to create poster: ${error}`,
  }));

  if (result.isErr()) {
    return err(result.error);
  }

  const buffer = await ResultAsync.fromPromise(fs.readFile(output), (error) => ({
    type: "FILE_SYSTEM_ERROR" as const,
    message: `❌ Failed to read poster file: ${error}`,
  }));

  if (buffer.isErr()) {
    return err(buffer.error);
  }

  const name = `poster_${id}_${Date.now()}.jpg`;
  return uploadFile(buffer.value, name, FILE_TYPES.JPG);
}
