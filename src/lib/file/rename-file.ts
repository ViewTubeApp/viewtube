import { utapi } from "@/utils/server/uploadthing";
import { ResultAsync } from "neverthrow";

interface RenameFileResult {
  success: boolean;
}

interface RenameFileError {
  type: "RENAME_FILE_ERROR";
  message: string;
}

/**
 * Rename a file
 * @param fileKey - The key of the file to rename
 * @param newName - The new name of the file
 * @returns The result of the rename operation
 */
export function renameFile(fileKey: string, newName: string): ResultAsync<RenameFileResult, RenameFileError> {
  return ResultAsync.fromPromise(utapi.renameFiles({ fileKey, newName }), (error) => ({
    type: "RENAME_FILE_ERROR" as const,
    message: `Failed to rename file: ${error}`,
  }));
}
