import { utapi } from "@/utils/server/uploadthing";
import { logger } from "@trigger.dev/sdk/v3";
import { err, ok } from "neverthrow";
import { ResultAsync } from "neverthrow";

import { type ProcessVideoPayload } from "../types";

export async function cleanupVideo(payload: ProcessVideoPayload) {
  const { file_key } = payload;

  logger.info("🗑️ Deleting original file from UploadThing", { file_key });

  // Delete the original file from UploadThing now that we've processed it and saved the compressed version
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
