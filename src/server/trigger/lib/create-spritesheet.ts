import { logger } from "@trigger.dev/sdk/v3";
import ffmpeg from "fluent-ffmpeg";
import { type Result, ResultAsync, err, ok } from "neverthrow";
import fs from "node:fs/promises";
import path from "node:path";
import { type UploadedFileData } from "uploadthing/types";

import { FILE_TYPES, type VideoProcessingError } from "../types";
import { uploadFile } from "./upload-file";

/**
 * Create a sprite sheet
 */
export async function createSpriteSheet(
  file: string,
  dir: string,
  id: number,
  rows: number,
  columns: number,
  interval: number,
  thumbnails: number,
  width: number,
  height: number,
): Promise<Result<UploadedFileData, VideoProcessingError>> {
  const name = `storyboard_${id}_${Date.now()}.jpg`;
  const output = path.join(dir, name);

  // Generate storyboard sprite sheet
  const promise = new Promise<void>((resolve, reject) => {
    // Select frames at even intervals across the video
    // To achieve this, we use the select filter with a careful calculation:
    // If we want N thumbnails evenly distributed in a video of duration D,
    // we need to select frames at timestamps: 0, D/(N-1), 2*D/(N-1), ..., D

    // Build a complex filter to select specific frames at calculated positions
    const positions = [];
    for (let i = 0; i < thumbnails; i++) {
      const timestamp = i * interval;
      positions.push(`eq(n,${Math.round(timestamp * 30)})`);
    }

    // Create a select filter that picks only the frames we want
    const select = `select='${positions.join("+")}'`;
    const filter = `${select},scale=${height}:${width}:force_original_aspect_ratio=decrease,pad=${height}:${width}:(ow-iw)/2:(oh-ih)/2,tile=${columns}x${rows}`;

    logger.debug("🎥 Creating sprite sheet with filter", { filter });

    const process = ffmpeg(file)
      .outputOptions([`-vf ${filter}`])
      .output(output);

    process
      .on("end", () => {
        logger.debug("✅ FFmpeg successfully created sprite sheet");
        resolve();
      })
      .on("error", (err) => {
        logger.error("❌ Error creating sprite image", { error: err });
        reject(new Error(`Error creating sprite image: ${err.message}`));
      })
      .run();
  });

  {
    const result = await ResultAsync.fromPromise(promise, (error) => ({
      type: "FFMPEG_ERROR" as const,
      message: `❌ Failed to create sprite sheet: ${error}`,
    }));

    if (result.isErr()) {
      return err(result.error);
    }
  }

  // Upload the storyboard image to UploadThing first, so we can reference its URL in the VTT file
  const buffer = await fs.readFile(output);
  const result = await uploadFile(buffer, name, FILE_TYPES.IMAGE);

  if (result.isErr()) {
    return err({ type: "FFMPEG_ERROR", message: `Failed to upload storyboard image: ${result.error}` });
  }

  return ok(result.value);
}
