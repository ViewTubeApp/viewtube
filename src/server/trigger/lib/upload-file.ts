import { utapi } from "@/utils/server/uploadthing";
import { logger } from "@trigger.dev/sdk/v3";
import { type Result, ResultAsync, err, ok } from "neverthrow";
import { UTFile } from "uploadthing/server";
import { type UploadedFileData } from "uploadthing/types";

import { type VideoProcessingError } from "../types";

/**
 * Upload a file to UploadThing
 */
export async function uploadFile(
  buffer: Buffer,
  name: string,
  type: string,
): Promise<Result<UploadedFileData, VideoProcessingError>> {
  logger.info(`🚀 Uploading ${name} to UploadThing...`);

  const file = new UTFile([buffer], name, { type: type });
  const response = await ResultAsync.fromPromise(utapi.uploadFiles(file), (error) => ({
    type: "UPLOAD_ERROR" as const,
    message: `❌ Failed to upload ${name}: ${error}`,
  }));

  if (response.isErr()) {
    return err(response.error);
  }

  if (!response.value.data) {
    return err({ type: "UPLOAD_ERROR", message: `❌ Failed to upload ${name}` });
  }

  logger.info(`✅ File has been uploaded`, { key: response.value.data.key });
  return ok(response.value.data);
}
