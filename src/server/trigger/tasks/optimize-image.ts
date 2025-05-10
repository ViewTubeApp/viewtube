import { logger, task } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { match } from "ts-pattern";

import { deleteFile } from "@/lib/utapi/delete-file";
import { uploadFile } from "@/lib/utapi/upload-file";

import { db } from "../../db";
import { categories, models } from "../../db/schema";
import { DEFAULT_WEBP_CONFIG } from "../config";
import { FILE_TYPES, type ProcessImagePayload } from "../types";

export const optimizeImageTask = task({
  id: "optimize-image",
  machine: "large-2x",

  run: async (payload: ProcessImagePayload) => {
    const { id: entity_id, url, entity } = payload;
    const cfg = DEFAULT_WEBP_CONFIG;

    // Create a temporary directory for processing
    const tmpdir = path.join(os.tmpdir(), `image_optimize_${entity_id}_${Date.now()}`);
    await fs.mkdir(tmpdir, { recursive: true });

    // Fetch the image
    const response = await fetch(url);
    if (!response.ok || !response.body) {
      throw new Error("Failed to fetch image");
    }

    const arrayBufferResult = await response.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBufferResult);

    // Convert to WebP
    const outputPath = path.join(tmpdir, `optimized_${entity_id}_${Date.now()}.webp`);

    logger.info(`Converting image to WebP`, { entity_id, outputPath });
    await sharp(inputBuffer).webp({ quality: cfg.quality }).toFile(outputPath);
    logger.info(`Image converted to WebP`, { entity_id, outputPath });

    // Read optimized file
    const outputBuffer = await fs.readFile(outputPath);

    // Upload optimized file
    const fileName = `optimized_${entity_id}_${Date.now()}.webp`;
    const uploadResult = await uploadFile(outputBuffer, fileName, FILE_TYPES.WEBP);
    if (uploadResult.isErr()) {
      throw new Error(`Failed to upload image: ${uploadResult.error.message}`);
    }

    const deleteResults = await deleteFile(payload.file_key);
    if (deleteResults.isErr()) {
      throw new Error(`Failed to cleanup image: ${deleteResults.error.message}`);
    }

    const table = match(entity)
      .with("model", () => models)
      .with("category", () => categories)
      .exhaustive();

    await db.update(table).set({ file_key: uploadResult.value.data!.key }).where(eq(table.id, entity_id));

    logger.info(`Image optimized`, { entity_id, file_key: uploadResult.value.data!.key });
  },
});

export type OptimizeImageTask = typeof optimizeImageTask;
