import ffmpeg from "fluent-ffmpeg";
import { type Result, ResultAsync, err } from "neverthrow";
import fs from "node:fs/promises";
import path from "node:path";
import { type UploadedFileData } from "uploadthing/types";

import { FILE_TYPES, type VideoProcessingError } from "../types";
import { uploadFile } from "./upload-file";

/**
 * Create compressed version of the video
 */
export async function compressVideo(
  videoPath: string,
  tempDirectory: string,
  videoId: number,
): Promise<Result<UploadedFileData, VideoProcessingError>> {
  const outputPath = path.join(tempDirectory, `compressed_${videoId}.mp4`);

  const promise = new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        "-c:v libx264", // Use H.264 codec
        "-crf 28", // Higher CRF for more compression (28 is near the upper limit for acceptable quality)
        "-preset veryslow", // Slowest preset for best compression
        "-vf scale=iw/2:ih/2", // Reduce resolution to half size
        "-c:a aac", // Use AAC for audio
        "-b:a 64k", // Reduce audio bitrate to 64k
        "-ac 1", // Convert to mono audio
      ])
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });

  const result = await ResultAsync.fromPromise(promise, (error) => ({
    type: "FFMPEG_ERROR" as const,
    message: `❌ Failed to compress video: ${error}`,
  }));

  if (result.isErr()) {
    return err(result.error);
  }

  // Upload to UploadThing
  const fileBuffer = await ResultAsync.fromPromise(fs.readFile(outputPath), (error) => ({
    type: "FILE_SYSTEM_ERROR" as const,
    message: `❌ Failed to read compressed video file: ${error}`,
  }));

  if (fileBuffer.isErr()) {
    return err(fileBuffer.error);
  }

  const fileName = `compressed_${videoId}_${Date.now()}.mp4`;
  return uploadFile(fileBuffer.value, fileName, FILE_TYPES.VIDEO);
}
