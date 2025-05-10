import { logger } from "@trigger.dev/sdk/v3";
import ffmpeg from "fluent-ffmpeg";
import { type Result, ResultAsync, err, ok } from "neverthrow";
import fs from "node:fs/promises";
import path from "node:path";
import { type UploadedFileData } from "uploadthing/types";

import { uploadFile } from "../../../lib/file/upload-file";
import { DEFAULT_TRAILER_CONFIG } from "../config";
import { FILE_TYPES, type VideoProcessingError } from "../types";
import { getScaleFilter } from "./get-scale-filter";

/**
 * Create a video trailer
 * @param videoPath - The path to the video file
 * @param tempdir - The directory to save the trailer file
 * @param videoId - The id of the video
 * @param duration - The duration of the video
 * @param width - The width of the video
 * @param height - The height of the video
 * @returns The result of the trailer creation
 */
export async function createTrailer(
  videoPath: string,
  tempdir: string,
  videoId: number,
  duration: number,
  width: number,
  height: number,
): Promise<Result<UploadedFileData, VideoProcessingError>> {
  const config = { ...DEFAULT_TRAILER_CONFIG };
  const scaleFilter = getScaleFilter(width, height, config);

  // Calculate clip start times based on strategy
  const clipStartTimes: number[] = [];

  if (config.selection_strategy === "uniform") {
    const interval = duration / config.clip_count;
    for (let i = 0; i < config.clip_count; i++) {
      const startTime = interval * i;
      if (startTime + config.clip_duration > duration) {
        break;
      }
      clipStartTimes.push(startTime);
    }
  } else if (config.selection_strategy === "random") {
    for (let i = 0; i < config.clip_count; i++) {
      const maxStart = duration - config.clip_duration;
      if (maxStart < 0) {
        break;
      }
      const startTime = Math.random() * maxStart;
      clipStartTimes.push(startTime);
    }
    // Sort in ascending order
    clipStartTimes.sort((a, b) => a - b);
  }

  // Create clips
  const clipPaths: string[] = [];
  for (let i = 0; i < clipStartTimes.length; i++) {
    const startTime = clipStartTimes[i];
    const clipPath = path.join(tempdir, `clip_${i}.mp4`);
    clipPaths.push(clipPath);

    const promise = new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .setStartTime(startTime || 0)
        .setDuration(config.clip_duration)
        .outputOptions([`-vf ${scaleFilter}`, "-c:v libx264", "-c:a aac"])
        .output(clipPath)
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .run();
    });

    const result = await ResultAsync.fromPromise(promise, (error) => ({
      type: "FFMPEG_ERROR" as const,
      message: `❌ Failed to create clip: ${error}`,
    }));

    if (result.isErr()) {
      return err(result.error);
    }
  }

  logger.debug("🎥 Clips created", { clipCount: clipPaths.length });

  // Create concatenation file
  const concatFilePath = path.join(tempdir, "concat.txt");
  const concatContent = clipPaths.map((p) => `file '${p}'`).join("\n");

  {
    const result = await ResultAsync.fromPromise(fs.writeFile(concatFilePath, concatContent), (error) => ({
      type: "FILE_SYSTEM_ERROR" as const,
      message: `❌ Failed to write concat file: ${error}`,
    }));

    if (result.isErr()) {
      return err(result.error);
    }
  }

  // Concatenate clips
  const trailerOutputPath = path.join(tempdir, `trailer_${videoId}.mp4`);

  const promise = new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(concatFilePath)
      .inputOptions(["-f concat", "-safe 0"])
      .outputOptions(["-c copy"])
      .output(trailerOutputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });

  const ffmpegResult = await ResultAsync.fromPromise(promise, (error) => ({
    type: "FFMPEG_ERROR" as const,
    message: `❌ Failed to create trailer: ${error}`,
  }));

  if (ffmpegResult.isErr()) {
    return err(ffmpegResult.error);
  }

  const fileBuffer = await ResultAsync.fromPromise(fs.readFile(trailerOutputPath), (error) => ({
    type: "FILE_SYSTEM_ERROR" as const,
    message: `❌ Failed to read trailer file: ${error}`,
  }));

  if (fileBuffer.isErr()) {
    return err(fileBuffer.error);
  }

  const fileName = `trailer_${videoId}_${Date.now()}.mp4`;
  const uploadResult = await uploadFile(fileBuffer.value, fileName, FILE_TYPES.MP4);

  if (uploadResult.isErr()) {
    return err(uploadResult.error);
  }

  return ok(uploadResult.value.data!);
}
