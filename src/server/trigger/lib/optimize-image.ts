import { type Result, ResultAsync, err, ok } from "neverthrow";
import fetch from "node-fetch";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { type UploadedFileData } from "uploadthing/types";

import { DEFAULT_WEBP_CONFIG } from "../config";
import { FILE_TYPES, type ProcessImagePayload, type VideoProcessingError, type WebPConfig } from "../types";
import { uploadFile } from "./upload-file";

/**
 * Optimize an image by converting it to WebP format and uploading it.
 */
export async function optimizeImage(
  payload: ProcessImagePayload,
  config?: WebPConfig,
): Promise<Result<UploadedFileData, VideoProcessingError>> {
  const { id: imageId, url } = payload;
  const cfg = config ?? DEFAULT_WEBP_CONFIG;

  // Create a temporary directory for processing
  const tmpdir = path.join(os.tmpdir(), `image_optimize_${imageId}_${Date.now()}`);

  const dirResult = await ResultAsync.fromPromise(fs.mkdir(tmpdir, { recursive: true }), (error) => ({
    type: "FILE_SYSTEM_ERROR" as const,
    message: `❌ Failed to create temporary directory: ${error}`,
  }));

  if (dirResult.isErr()) {
    return err(dirResult.error);
  }

  // Fetch the image
  const response = await fetch(url);

  if (!response.ok) {
    return err({ type: "FETCH_ERROR", message: `❌ Failed to fetch image: ${response.statusText}` });
  }

  const arrayBufferResult = await ResultAsync.fromPromise(response.arrayBuffer(), (error) => ({
    type: "FETCH_ERROR" as const,
    message: `❌ Failed to download image: ${error}`,
  }));

  if (arrayBufferResult.isErr()) {
    return err(arrayBufferResult.error);
  }

  const inputBuffer = Buffer.from(arrayBufferResult.value);

  // Convert to WebP
  const outputPath = path.join(tmpdir, `optimized_${imageId}.webp`);

  const sharpResult = await ResultAsync.fromPromise(
    sharp(inputBuffer).webp({ quality: cfg.quality }).toFile(outputPath),
    (error) => ({ type: "SHARP_ERROR" as const, message: `❌ Failed to convert image to WebP: ${error}` }),
  );

  if (sharpResult.isErr()) {
    return err(sharpResult.error);
  }

  // Read optimized file
  const readResult = await ResultAsync.fromPromise(fs.readFile(outputPath), (error) => ({
    type: "FILE_SYSTEM_ERROR" as const,
    message: `❌ Failed to read optimized image: ${error}`,
  }));

  if (readResult.isErr()) {
    return err(readResult.error);
  }

  const outputBuffer = readResult.value;

  // Upload optimized file
  const fileName = `optimized_${imageId}_${Date.now()}.webp`;
  const uploadResult = await uploadFile(outputBuffer, fileName, FILE_TYPES.WEBP);

  if (uploadResult.isErr()) {
    return err(uploadResult.error);
  }

  return ok(uploadResult.value);
}
