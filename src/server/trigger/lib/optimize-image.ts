import { logger } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import { type Result, ResultAsync, err, ok } from "neverthrow";
import fetch from "node-fetch";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { match } from "ts-pattern";
import { type UploadedFileData } from "uploadthing/types";

import { db } from "@/server/db";
import { categories } from "@/server/db/schema";
import { models } from "@/server/db/schema";

import { uploadFile } from "../../../lib/file/upload-file";
import { DEFAULT_WEBP_CONFIG } from "../config";
import { FILE_TYPES, type ProcessImagePayload, type VideoProcessingError, type WebPConfig } from "../types";

/**
 * Optimize an image by converting it to WebP format and uploading it.
 * @param payload - The payload containing the image data
 * @param config - The configuration for the WebP conversion
 * @returns The result of the image optimization
 */
export async function optimizeImage(
  payload: ProcessImagePayload,
  config?: WebPConfig,
): Promise<Result<UploadedFileData, VideoProcessingError>> {
  const { id: entity_id, url, entity } = payload;
  const cfg = config ?? DEFAULT_WEBP_CONFIG;

  // Create a temporary directory for processing
  const tmpdir = path.join(os.tmpdir(), `image_optimize_${entity_id}_${Date.now()}`);

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
  const outputPath = path.join(tmpdir, `optimized_${entity_id}_${Date.now()}.webp`);

  logger.info(`🎨 Converting image to WebP`, { entity_id, outputPath });

  const sharpResult = await ResultAsync.fromPromise(
    sharp(inputBuffer).webp({ quality: cfg.quality }).toFile(outputPath),
    (error) => ({ type: "SHARP_ERROR" as const, message: `❌ Failed to convert image to WebP: ${error}` }),
  );

  logger.info(`✅ Image converted to WebP`, { entity_id, outputPath });

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
  const fileName = `optimized_${entity_id}_${Date.now()}.webp`;
  const uploadResult = await uploadFile(outputBuffer, fileName, FILE_TYPES.WEBP);

  if (uploadResult.isErr()) {
    return err(uploadResult.error);
  }

  const table = match(entity)
    .with("model", () => models)
    .with("category", () => categories)
    .exhaustive();

  const promise = db.update(table).set({ file_key: uploadResult.value.data!.key }).where(eq(table.id, entity_id));

  const result = await ResultAsync.fromPromise(promise, (error) => ({
    type: "DATABASE_ERROR" as const,
    message: `❌ Failed to update ${entity} status: ${error}`,
  }));

  if (result.isErr()) {
    return err(result.error);
  }

  logger.info(`✅ Image optimized`, { entity_id, file_key: uploadResult.value.data!.key });

  return ok(uploadResult.value.data!);
}
