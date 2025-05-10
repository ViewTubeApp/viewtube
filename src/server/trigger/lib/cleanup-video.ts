import { utapi } from "@/utils/server/uploadthing";
import { logger } from "@trigger.dev/sdk/v3";
import { err, ok } from "neverthrow";
import { ResultAsync } from "neverthrow";

import { type ProcessVideoPayload } from "../types";

/**
 * Cleanup a video by deleting the original file
 */
export async function cleanupVideo(payload: ProcessVideoPayload) {
  const { file_key } = payload;

  logger.info("🗑️ Deleting original file", { file_key });

  const result = await ResultAsync.fromPromise(utapi.deleteFiles(file_key), (error) => ({
    type: "UPLOAD_ERROR" as const,
    message: `❌ Failed to delete file: ${error}`,
  }));

  if (result.isErr()) {
    return err(result.error);
  }

  logger.info("✅ Successfully deleted original file");

  return ok();
}
