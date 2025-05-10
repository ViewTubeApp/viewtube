import { utapi } from "@/utils/server/utapi";
import { ResultAsync } from "neverthrow";

interface DeleteFileResult {
  success: boolean;
  deletedCount: number;
}

interface DeleteFileError {
  type: "DELETE_FILE_ERROR";
  message: string;
}

/**
 * Deletes a file from UploadThing
 * @param fileKey - The key of the file to delete
 * @returns A ResultAsync object containing the result of the deletion
 */
export function deleteFile(fileKey: string): ResultAsync<DeleteFileResult, DeleteFileError> {
  return ResultAsync.fromPromise(utapi.deleteFiles(fileKey), (error) => ({
    type: "DELETE_FILE_ERROR" as const,
    message: `Failed to delete file: ${error}`,
  }));
}
