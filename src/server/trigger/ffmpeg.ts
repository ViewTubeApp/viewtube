import { utapi } from "@/utils/server/uploadthing";
import { UTFile } from "@/utils/server/uploadthing";
import { logger, task } from "@trigger.dev/sdk/v3";
import { and, eq } from "drizzle-orm";
import ffmpeg from "fluent-ffmpeg";
import invariant from "invariant";
import { type Result, ResultAsync, err, ok } from "neverthrow";
import fetch from "node-fetch";
import { exec } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { promisify } from "node:util";
import { type UploadedFileData } from "uploadthing/types";

import { db } from "../db";
import { videos } from "../db/schema";

const exec_async = promisify(exec);

type VideoProcessingError =
  | { type: "FETCH_ERROR"; message: string }
  | { type: "PROBE_ERROR"; message: string }
  | { type: "FFMPEG_ERROR"; message: string }
  | { type: "UPLOAD_ERROR"; message: string }
  | { type: "FILE_SYSTEM_ERROR"; message: string }
  | { type: "DATABASE_ERROR"; message: string };

interface WebVTTConfig {
  numThumbnails: number;
  numColumns: number;
  width: number;
  height: number;
}

interface TrailerConfig {
  clipDuration: number;
  clipCount: number;
  selectionStrategy: "uniform" | "random";
  width: number;
  height: number;
  targetDuration: number;
  aspectRatioStrategy: "fit" | "crop" | "stretch";
  maxWidth: number;
  maxHeight: number;
}

interface ProcessingResult {
  duration: number;
  poster_key: string;
  storyboard_key: string;
  thumbnail_key: string;
  trailer_key: string;
  compressed_key: string;
}

interface WebVTTResult {
  thumbnails_vtt: UploadedFileData;
  storyboard_image: UploadedFileData;
}

const DEFAULT_WEBVTT_CONFIG: WebVTTConfig = {
  numThumbnails: 25,
  numColumns: 5,
  width: 160,
  height: 90,
};

const DEFAULT_TRAILER_CONFIG: TrailerConfig = {
  clipDuration: 3.0,
  clipCount: 5,
  selectionStrategy: "uniform",
  width: 640,
  height: 360,
  targetDuration: 15.0,
  aspectRatioStrategy: "fit",
  maxWidth: 1280,
  maxHeight: 720,
};

const FILE_TYPES = {
  IMAGE: "image/jpeg",
  VIDEO: "video/mp4",
  TEXT: "text/plain",
} as const;

/**
 * Upload a file to UploadThing
 */
async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  fileType: string,
): Promise<Result<UploadedFileData, VideoProcessingError>> {
  try {
    const file = new UTFile([fileBuffer], fileName, { type: fileType });
    const response = await utapi.uploadFiles(file);

    if (!response.data) {
      return err({ type: "UPLOAD_ERROR", message: `Failed to upload ${fileName}` });
    }

    logger.info(`File uploaded to UploadThing`, { key: response.data.key });
    return ok(response.data);
  } catch (error) {
    return err({ type: "UPLOAD_ERROR", message: `Upload failed: ${error}` });
  }
}

interface VideoInfo {
  duration: number;
  width: number;
  height: number;
}

/**
 * Get video information using ffprobe
 */
async function probeVideo(videoPath: string): Promise<Result<VideoInfo, VideoProcessingError>> {
  try {
    // Get duration
    const { stdout: durationOutput } = await exec_async(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`,
    );
    const duration = parseFloat(durationOutput.trim());

    // Get dimensions
    const { stdout: dimensionsOutput } = await exec_async(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${videoPath}"`,
    );

    const dimensions = dimensionsOutput.trim().split("x");
    const width = parseInt(dimensions[0] || "0", 10);
    const height = parseInt(dimensions[1] || "0", 10);

    if (isNaN(duration) || isNaN(width) || isNaN(height)) {
      return err({ type: "PROBE_ERROR", message: "Invalid video dimensions or duration" });
    }

    return ok({ duration, width, height });
  } catch (error) {
    // Try alternative approach for dimensions
    try {
      const { stdout: buffer } = await exec_async(
        `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of json "${videoPath}"`,
      );

      const result = JSON.parse(buffer);
      if (result.streams && result.streams.length > 0) {
        const width = result.streams[0].width;
        const height = result.streams[0].height;

        // Still get duration
        const { stdout: durationOutput } = await exec_async(
          `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`,
        );
        const duration = parseFloat(durationOutput.trim());

        if (isNaN(duration) || isNaN(width) || isNaN(height)) {
          return err({ type: "PROBE_ERROR", message: "Invalid video dimensions or duration from alternative method" });
        }

        return ok({ duration, width, height });
      }
    } catch (error) {
      logger.error("Error in alternative video info approach", { error: error });
    }

    return err({ type: "PROBE_ERROR", message: `Failed to get video information: ${error}` });
  }
}

/**
 * Format time for WebVTT
 */
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds / 60) % 60);
  const s = seconds - (h * 3600 + m * 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toFixed(3).padStart(6, "0")}`;
}

/**
 * Get the appropriate scale filter based on video orientation and config
 */
function getScaleFilter(width: number, height: number, config: TrailerConfig) {
  const strategy = config.aspectRatioStrategy;
  const orientation = height > width ? "portrait" : "landscape";

  // Default dimensions from config
  let targetWidth = config.width;
  let targetHeight = config.height;

  // Check if we need to adjust dimensions based on orientation
  if (orientation === "portrait") {
    // For portrait videos, we might want to swap dimensions or use different logic
    const maxWidth = config.maxWidth;
    const maxHeight = config.maxHeight;

    // Adjust target dimensions based on orientation while respecting max dimensions
    if (strategy === "fit") {
      // Calculate scaled dimensions while maintaining aspect ratio
      const aspectRatio = width / height;

      // Try scaling by height first
      const newWidth = Math.floor(maxHeight * aspectRatio);
      if (newWidth <= maxWidth) {
        // Height-constrained
        targetWidth = newWidth;
        targetHeight = maxHeight;
      } else {
        // Width-constrained
        targetWidth = maxWidth;
        targetHeight = Math.floor(maxWidth / aspectRatio);
      }
    }
  }

  if (strategy === "fit") {
    return `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2`;
  }

  if (strategy === "crop") {
    return `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=increase,crop=${targetWidth}:${targetHeight}`;
  }

  if (strategy === "stretch") {
    return `scale=${targetWidth}:${targetHeight}`;
  }

  return `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2`;
}

/**
 * Create a video poster (thumbnail)
 */
async function createPoster(
  videoPath: string,
  tempDirectory: string,
  videoId: number,
): Promise<Result<UploadedFileData, VideoProcessingError>> {
  const outputPath = path.join(tempDirectory, `poster_${videoId}.jpg`);

  const promise = new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        size: "640x?",
        timestamps: ["00:00:01"],
        folder: path.dirname(outputPath),
        filename: path.basename(outputPath),
      })
      .on("end", () => resolve())
      .on("error", (err) => reject(err));
  });

  const result = await ResultAsync.fromPromise(promise, (error) => ({
    type: "FFMPEG_ERROR" as const,
    message: `Failed to create poster: ${error}`,
  }));

  if (result.isErr()) {
    return err(result.error);
  }

  logger.info("Poster created", { outputPath });

  // Upload to UploadThing
  const fileName = `poster_${videoId}_${Date.now()}.jpg`;
  const fileBuffer = await fs.readFile(outputPath);

  return uploadFile(fileBuffer, fileName, FILE_TYPES.IMAGE);
}

/**
 * Create WebVTT storyboard (thumbnails and VTT file)
 */
async function createWebVTT(
  videoPath: string,
  tmpDir: string,
  videoId: number,
  duration: number,
  width: number,
  height: number,
): Promise<Result<WebVTTResult, VideoProcessingError>> {
  const config = { ...DEFAULT_WEBVTT_CONFIG };
  const isPortrait = height > width;

  // Determine sprite dimensions based on orientation
  let spriteWidth = config.width;
  let spriteHeight = config.height;

  if (isPortrait) {
    spriteWidth = config.height;
    spriteHeight = config.width;
    logger.info("Portrait video detected, swapping dimensions", { spriteWidth, spriteHeight });
  }

  // Calculate intervals based on total duration and desired thumbnail count
  const interval = duration / config.numThumbnails;
  logger.info("Calculated interval between thumbnails", {
    duration,
    numThumbnails: config.numThumbnails,
    interval,
  });

  const numThumbnails = config.numThumbnails;
  const numRows = Math.ceil(numThumbnails / config.numColumns);
  logger.info("Storyboard dimensions", {
    numRows,
    numThumbnails,
    numColumns: config.numColumns,
  });

  const spriteFileName = `storyboard_${videoId}_${Date.now()}.jpg`;
  const spriteOutputPath = path.join(tmpDir, spriteFileName);

  // Generate storyboard sprite sheet
  const promise = new Promise<void>((resolve, reject) => {
    // Select frames at even intervals across the video
    // To achieve this, we use the select filter with a careful calculation:
    // If we want N thumbnails evenly distributed in a video of duration D,
    // we need to select frames at timestamps: 0, D/(N-1), 2*D/(N-1), ..., D

    // Build a complex filter to select specific frames at calculated positions
    const framePositions = [];
    for (let i = 0; i < numThumbnails; i++) {
      // Calculate timestamp of this frame
      const timestamp = i * interval;
      // Convert to frame number (assuming 30fps for simplicity)
      framePositions.push(`eq(n,${Math.round(timestamp * 30)})`);
    }

    // Create a select filter that picks only the frames we want
    const selectFilter = `select='${framePositions.join("+")}'`;
    const filterComplex = `${selectFilter},scale=${spriteWidth}:${spriteHeight}:force_original_aspect_ratio=decrease,pad=${spriteWidth}:${spriteHeight}:(ow-iw)/2:(oh-ih)/2,tile=${config.numColumns}x${numRows}`;

    logger.info("Creating sprite sheet with filter", { filterComplex });

    const ffmpegProcess = ffmpeg(videoPath)
      .outputOptions([`-vf ${filterComplex}`])
      .output(spriteOutputPath);

    // Capture stderr output
    let stderr = "";
    ffmpegProcess.on("stderr", (stderrLine) => {
      stderr += stderrLine + "\n";
    });

    ffmpegProcess
      .on("end", () => {
        logger.info("FFmpeg successfully created sprite sheet");
        resolve();
      })
      .on("error", (err) => {
        logger.error("Error creating sprite image", { error: err, stderr });
        reject(new Error(`Error creating sprite image: ${err.message}\nstderr: ${stderr}`));
      })
      .run();
  });

  const result = await ResultAsync.fromPromise(promise, (error) => ({
    type: "FFMPEG_ERROR" as const,
    message: `Failed to create sprite sheet: ${error}`,
  }));

  if (result.isErr()) {
    return err(result.error);
  }

  logger.info("Sprite sheet created", { spriteOutputPath });

  // Verify the output file exists and is not empty
  try {
    const fileStats = await fs.stat(spriteOutputPath);
    if (fileStats.size === 0) {
      throw new Error(`Output sprite file is empty: ${spriteOutputPath}`);
    }
    logger.info("Verified sprite file", { size: fileStats.size });
  } catch (error) {
    logger.error("Failed to verify sprite file", { error });
    throw error;
  }

  // Upload the storyboard image to UploadThing first, so we can reference its URL in the VTT file
  const imageBuffer = await fs.readFile(spriteOutputPath);
  const spriteFile = await uploadFile(imageBuffer, spriteFileName, FILE_TYPES.IMAGE);

  if (spriteFile.isErr()) {
    return err({ type: "FFMPEG_ERROR", message: `Failed to upload storyboard image: ${spriteFile.error}` });
  }

  // Generate VTT file
  const vttFileName = `thumbnails_${videoId}_${Date.now()}.vtt`;
  const vttOutputPath = path.join(tmpDir, vttFileName);
  const vttContent = ["WEBVTT", ""];

  // Create VTT cues for each thumbnail
  for (let i = 0; i < numThumbnails; i++) {
    // Calculate start and end times for each cue
    const startTime = i * interval;
    const endTime = Math.min((i + 1) * interval, duration);

    const row = Math.floor(i / config.numColumns);
    const col = i % config.numColumns;
    const x = col * spriteWidth;
    const y = row * spriteHeight;

    vttContent.push(
      `${formatTime(startTime)} --> ${formatTime(endTime)}`,
      `${spriteFile.value.ufsUrl}#xywh=${x},${y},${spriteWidth},${spriteHeight}`,
      "",
    );
  }

  await fs.writeFile(vttOutputPath, vttContent.join("\n"));
  logger.info("VTT file created", { vttOutputPath });

  // Upload the VTT file to UploadThing
  const vttBuffer = await fs.readFile(vttOutputPath);
  const vttFile = await uploadFile(vttBuffer, vttFileName, "text/vtt");

  if (vttFile.isErr()) {
    return err({ type: "FFMPEG_ERROR", message: `Failed to upload VTT file: ${vttFile.error}` });
  }

  logger.info("Storyboard generation complete", {
    numThumbnails,
    vttFile: vttFile.value.key,
    spriteFile: spriteFile.value.key,
  });

  // Return both keys as a record
  return ok({
    thumbnails_vtt: vttFile.value,
    storyboard_image: spriteFile.value,
  });
}

/**
 * Create a video trailer
 */
async function createTrailer(
  videoPath: string,
  tempDirectory: string,
  videoId: number,
  duration: number,
  width: number,
  height: number,
): Promise<Result<UploadedFileData, VideoProcessingError>> {
  const config = { ...DEFAULT_TRAILER_CONFIG };
  const scaleFilter = getScaleFilter(width, height, config);

  // Calculate clip start times based on strategy
  const clipStartTimes: number[] = [];

  if (config.selectionStrategy === "uniform") {
    const interval = duration / config.clipCount;
    for (let i = 0; i < config.clipCount; i++) {
      const startTime = interval * i;
      if (startTime + config.clipDuration > duration) {
        break;
      }
      clipStartTimes.push(startTime);
    }
  } else if (config.selectionStrategy === "random") {
    for (let i = 0; i < config.clipCount; i++) {
      const maxStart = duration - config.clipDuration;
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
    const clipPath = path.join(tempDirectory, `clip_${i}.mp4`);
    clipPaths.push(clipPath);

    const promise = new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .setStartTime(startTime || 0)
        .setDuration(config.clipDuration)
        .outputOptions([`-vf ${scaleFilter}`, "-c:v libx264", "-c:a aac"])
        .output(clipPath)
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .run();
    });

    const result = await ResultAsync.fromPromise(promise, (error) => ({
      type: "FFMPEG_ERROR" as const,
      message: `Failed to create clip: ${error}`,
    }));

    if (result.isErr()) {
      return err(result.error);
    }
  }

  logger.info("Clips created", { clipCount: clipPaths.length });

  // Create concatenation file
  const concatFilePath = path.join(tempDirectory, "concat.txt");
  const concatContent = clipPaths.map((p) => `file '${p}'`).join("\n");
  await fs.writeFile(concatFilePath, concatContent);

  // Concatenate clips
  const trailerOutputPath = path.join(tempDirectory, `trailer_${videoId}.mp4`);

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

  const result = await ResultAsync.fromPromise(promise, (error) => ({
    type: "FFMPEG_ERROR" as const,
    message: `Failed to create trailer: ${error}`,
  }));

  if (result.isErr()) {
    return err(result.error);
  }

  logger.info("Trailer created", { trailerOutputPath });

  // Upload trailer to UploadThing
  const fileBuffer = await fs.readFile(trailerOutputPath);
  const fileName = `trailer_${videoId}_${Date.now()}.mp4`;

  return uploadFile(fileBuffer, fileName, FILE_TYPES.VIDEO);
}

/**
 * Create compressed version of the video
 */
async function compressVideo(
  videoPath: string,
  tempDirectory: string,
  videoId: number,
): Promise<Result<UploadedFileData, VideoProcessingError>> {
  const outputPath = path.join(tempDirectory, `compressed_${videoId}.mp4`);

  const promise = new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        "-c:v libx264", // Use H.264 codec
        "-crf 28", // Higher CRF for more compression (28 is near the upper limit for acceptable quality)
        "-preset veryslow", // Slowest preset for best compression
        "-vf scale=iw/2:ih/2", // Reduce resolution to half size
        "-c:a aac", // Use AAC for audio
        "-b:a 64k", // Reduce audio bitrate to 64k
        "-ac 1", // Convert to mono audio
      ])
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });

  const result = await ResultAsync.fromPromise(promise, (error) => ({
    type: "FFMPEG_ERROR" as const,
    message: `Failed to compress video: ${error}`,
  }));

  if (result.isErr()) {
    return err(result.error);
  }

  logger.info("Compressed video created", { outputPath });

  // Upload to UploadThing
  const fileBuffer = await fs.readFile(outputPath);
  const fileName = `compressed_${videoId}_${Date.now()}.mp4`;

  return uploadFile(fileBuffer, fileName, FILE_TYPES.VIDEO);
}

interface ProcessVideoPayload {
  videoId: number;
  fileKey: string;
  videoUrl: string;
}

/**
 * Process a video - create poster, storyboard (WebVTT), trailer, and update video metadata
 */
async function processVideo(payload: ProcessVideoPayload): Promise<Result<ProcessingResult, VideoProcessingError>> {
  const { videoId, fileKey, videoUrl } = payload;

  // Update video status to processing
  {
    const promise = db
      .update(videos)
      .set({ status: "processing" })
      .where(and(eq(videos.id, videoId)));

    const result = await ResultAsync.fromPromise(promise, (error) => ({
      type: "DATABASE_ERROR" as const,
      message: `Failed to update video status: ${error}`,
    }));

    if (result.isErr()) {
      return err(result.error);
    }
  }

  logger.info("Starting video processing", { videoId, videoUrl });

  const tmpdir = path.join(os.tmpdir(), `video_processing_${videoId}_${Date.now()}`);

  // Create temporary directory for processing
  {
    const promise = fs.mkdir(tmpdir, { recursive: true });

    const result = await ResultAsync.fromPromise(promise, (error) => ({
      type: "FILE_SYSTEM_ERROR" as const,
      message: `Failed to create temporary directory: ${error}`,
    }));

    if (result.isErr()) {
      return err(result.error);
    }
  }

  // Fetch the video
  const response = await fetch(videoUrl);
  if (!response.ok || !response.body) {
    return err({ type: "FETCH_ERROR", message: "Failed to fetch video" });
  }

  // Download the video to a temporary file
  const videoPath = path.join(tmpdir, "original.mp4");
  const writeStream = await fs.open(videoPath, "w");
  const readableStream = Readable.from(response.body);

  // Setup a writable stream to save the file
  const promise = new Promise<void>((resolve, reject) => {
    readableStream
      .on("data", (chunk) => {
        void writeStream.write(chunk);
      })
      .on("end", () => {
        void writeStream.close().then(resolve).catch(reject);
      })
      .on("error", (err) => {
        void writeStream
          .close()
          .then(() => reject(err))
          .catch(reject);
      });
  });

  const result = await ResultAsync.fromPromise(promise, (error) => ({
    type: "FFMPEG_ERROR" as const,
    message: `Failed to download video: ${error}`,
  }));

  if (result.isErr()) {
    return err(result.error);
  }

  logger.info("Video downloaded to temporary file", { videoPath });

  // Get video information
  const videoInfoResult = await probeVideo(videoPath);
  if (videoInfoResult.isErr()) {
    return err(videoInfoResult.error);
  }

  const { duration, width, height } = videoInfoResult.value;
  logger.info("Video info", { duration, width, height });

  // Tasks to execute
  const [posterResult, webVttResult, trailerResult, compressedResult] = await Promise.all([
    createPoster(videoPath, tmpdir, videoId),
    createWebVTT(videoPath, tmpdir, videoId, duration, width, height),
    createTrailer(videoPath, tmpdir, videoId, duration, width, height),
    compressVideo(videoPath, tmpdir, videoId),
  ]);

  // Check for errors in any of the results
  if (posterResult.isErr()) return err(posterResult.error);
  if (webVttResult.isErr()) return err(webVttResult.error);
  if (trailerResult.isErr()) return err(trailerResult.error);
  if (compressedResult.isErr()) return err(compressedResult.error);

  // All tasks succeeded, collect keys
  const keys = {
    poster_key: posterResult.value.key,
    storyboard_key: webVttResult.value.storyboard_image.key,
    thumbnail_key: webVttResult.value.thumbnails_vtt.key,
    trailer_key: trailerResult.value.key,
    compressed_key: compressedResult.value.key,
  };

  // Update the video record with processing results and duration
  {
    const promise = db
      .update(videos)
      .set({
        status: "completed",
        poster_key: keys.poster_key,
        file_key: keys.compressed_key,
        trailer_key: keys.trailer_key,
        thumbnail_key: keys.thumbnail_key,
        storyboard_key: keys.storyboard_key,
        processing_completed_at: new Date(),
        video_duration: Math.floor(duration),
      })
      .where(and(eq(videos.id, videoId)));

    const result = await ResultAsync.fromPromise(promise, (error) => ({
      type: "DATABASE_ERROR" as const,
      message: `Failed to update video status: ${error}`,
    }));

    if (result.isErr()) {
      return err(result.error);
    }

    // Delete the original file from UploadThing now that we've processed it and saved the compressed version
    try {
      logger.info("Deleting original file from UploadThing", { fileKey });
      await utapi.deleteFiles(fileKey);
      logger.info("Successfully deleted original file");
    } catch (error) {
      // Don't fail the entire process if we can't delete the file
      logger.error("Failed to delete original file", { error: error });
    }

    // Clean up temporary files
    {
      const result = await ResultAsync.fromPromise(fs.rm(tmpdir, { recursive: true, force: true }), (error) => ({
        type: "FILE_SYSTEM_ERROR" as const,
        message: `Failed to clean up temporary directory: ${error}`,
      }));

      if (result.isErr()) {
        return err(result.error);
      }
    }

    logger.info("Video processing completed successfully", { videoId, resultKeys: keys });

    return ok({ duration, ...keys });
  }
}
/**
 * Process a video - create poster, storyboard (WebVTT), trailer, and update video metadata
 */
export const processVideoTask = task({
  id: "process-video",
  run: async (payload: ProcessVideoPayload) => {
    const result = await processVideo(payload);
    invariant(result.isOk(), "Failed to process video");
    return result.value;
  },
});

export type ProcessVideoTask = typeof processVideoTask;
