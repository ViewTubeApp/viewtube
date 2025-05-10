import { utapi } from "@/utils/server/uploadthing";
import { ResultAsync } from "neverthrow";
import { UTFile } from "uploadthing/server";
import { type UploadFileResult } from "uploadthing/types";

interface UploadFileError {
  type: "UPLOAD_FILE_ERROR";
  message: string;
}

/**
 * Upload a file
 * @param buffer - The buffer to upload
 * @param name - The name of the file
 * @param type - The type of the file
 * @returns The uploaded file data
 */
export async function uploadFile(
  buffer: Buffer,
  name: string,
  type: string,
): Promise<ResultAsync<UploadFileResult, UploadFileError>> {
  const file = new UTFile([buffer], name, { type: type });

  return ResultAsync.fromPromise(utapi.uploadFiles(file), (error) => ({
    type: "UPLOAD_FILE_ERROR" as const,
    message: `❌ Failed to upload ${name}: ${error}`,
  }));
}
