import { utapi } from "@/utils/server/uploadthing";
import { logger } from "@trigger.dev/sdk/v3";
import { ResultAsync, err, ok } from "neverthrow";

import { type ProcessImagePayload } from "../types";

/**
 * Cleanup an image by deleting the original file
 * @param payload - The payload containing the image data
 */
export async function cleanupImage(payload: ProcessImagePayload) {
  const { file_key } = payload;

  logger.info("🗑️ Deleting original file", { file_key });

  const result = await ResultAsync.fromPromise(utapi.deleteFiles(file_key), (error) => ({
    type: "UPLOAD_FILE_ERROR" as const,
    message: `❌ Failed to delete file: ${error}`,
  }));

  if (result.isErr()) {
    return err(result.error);
  }

  logger.info("✅ Successfully deleted original file");

  return ok();
}
