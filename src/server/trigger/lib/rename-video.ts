import { ResultAsync, err, ok } from "neverthrow";

import { renameFile } from "@/lib/file/rename-file";

/**
 * Rename a video file
 * @param fileKey - The key of the video file
 * @param videoId - The id of the video
 * @returns The result of the rename operation
 */
export async function renameVideo(fileKey: string, videoId: number) {
  const fileName = `video_${videoId}_${Date.now()}.mp4`;

  const response = await ResultAsync.fromPromise(renameFile(fileKey, fileName), (error) => ({
    type: "RENAME_FILE_ERROR" as const,
    message: `❌ Failed to rename file: ${error}`,
  }));

  if (response.isErr()) {
    return err(response.error);
  }

  return ok({ key: fileName });
}
