import { type Result, ResultAsync, err } from "neverthrow";
import fs from "node:fs/promises";
import { type UploadedFileData } from "uploadthing/types";

import { FILE_TYPES, type VideoProcessingError } from "../types";
import { uploadFile } from "./upload-file";

/**
 * Read the original video file and upload it renamed
 */
export async function renameVideo(
  videoPath: string,
  videoId: number,
): Promise<Result<UploadedFileData, VideoProcessingError>> {
  const fileBuffer = await ResultAsync.fromPromise(fs.readFile(videoPath), (error) => ({
    type: "FILE_SYSTEM_ERROR" as const,
    message: `❌ Failed to read video file: ${error}`,
  }));

  if (fileBuffer.isErr()) {
    return err(fileBuffer.error);
  }

  const fileName = `video_${videoId}_${Date.now()}.mp4`;
  return uploadFile(fileBuffer.value, fileName, FILE_TYPES.MP4);
}
