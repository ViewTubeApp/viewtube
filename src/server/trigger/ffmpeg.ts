import { utapi } from "@/utils/server/uploadthing";
import { UTFile } from "@/utils/server/uploadthing";
import { logger, task } from "@trigger.dev/sdk/v3";
import { and, eq } from "drizzle-orm";
import ffmpeg from "fluent-ffmpeg";
import invariant from "invariant";
import fetch from "node-fetch";
import { exec } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { promisify } from "node:util";

import { db } from "../db";
import { videos } from "../db/schema";

const exec_async = promisify(exec);

interface WebVTTConfig {
  numThumbnails: number; // Total number of thumbnails to generate
  numColumns: number; // Number of columns in the sprite sheet
  width: number; // Width of each thumbnail
  height: number; // Height of each thumbnail
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

const DEFAULT_WEBVTT_CONFIG: WebVTTConfig = {
  numThumbnails: 25, // Generate 25 thumbnails total
  numColumns: 5, // Number of columns in the sprite sheet
  width: 160, // Width of each thumbnail
  height: 90, // Height of each thumbnail
};

const DEFAULT_TRAILER_CONFIG: TrailerConfig = {
  clipDuration: 3.0, // Duration of each clip in seconds
  clipCount: 5, // Number of clips to include
  selectionStrategy: "uniform", // uniform or random
  width: 640, // Width of the trailer video
  height: 360, // Height of the trailer video
  targetDuration: 15.0, // Target duration of the trailer
  aspectRatioStrategy: "fit", // fit, crop, or stretch
  maxWidth: 1280, // Maximum width
  maxHeight: 720, // Maximum height
};

const FILE_TYPES = {
  IMAGE: "image/jpeg",
  VIDEO: "video/mp4",
  TEXT: "text/plain",
} as const;

/**
 * Upload a file to UploadThing
 */
async function uploadFile(fileBuffer: Buffer, fileName: string, fileType: string) {
  const file = new UTFile([fileBuffer], fileName, { type: fileType });
  const response = await utapi.uploadFiles(file);

  invariant(response.data, `Failed to upload ${fileName}`);

  logger.info(`File uploaded to UploadThing`, { key: response.data.key });
  return response.data;
}

/**
 * Get video information using ffprobe
 */
async function probeVideo(videoPath: string) {
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

    return { duration, width, height };
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

        return { duration, width, height };
      }
    } catch (error) {
      logger.error("Error in alternative video info approach", { error: error });
    }

    throw new Error(`Failed to get video information: ${error}`);
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
async function createPoster(videoPath: string, tempDirectory: string, videoId: number) {
  const outputPath = path.join(tempDirectory, `poster_${videoId}.jpg`);

  await new Promise<void>((resolve, reject) => {
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
) {
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
  await new Promise<void>((resolve, reject) => {
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
      `${spriteFile.ufsUrl}#xywh=${x},${y},${spriteWidth},${spriteHeight}`,
      "",
    );
  }

  await fs.writeFile(vttOutputPath, vttContent.join("\n"));
  logger.info("VTT file created", { vttOutputPath });

  // Upload the VTT file to UploadThing
  const vttBuffer = await fs.readFile(vttOutputPath);
  const vttFile = await uploadFile(vttBuffer, vttFileName, "text/vtt");

  logger.info("Storyboard generation complete", {
    numThumbnails,
    vttFile: vttFile.key,
    spriteFile: spriteFile.key,
  });

  // Return both keys as a record
  return {
    thumbnails_vtt: vttFile,
    storyboard_image: spriteFile,
  };
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
) {
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

    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .setStartTime(startTime || 0)
        .setDuration(config.clipDuration)
        .outputOptions([`-vf ${scaleFilter}`, "-c:v libx264", "-c:a aac"])
        .output(clipPath)
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .run();
    });
  }

  logger.info("Clips created", { clipCount: clipPaths.length });

  // Create concatenation file
  const concatFilePath = path.join(tempDirectory, "concat.txt");
  const concatContent = clipPaths.map((p) => `file '${p}'`).join("\n");
  await fs.writeFile(concatFilePath, concatContent);

  // Concatenate clips
  const trailerOutputPath = path.join(tempDirectory, `trailer_${videoId}.mp4`);

  await new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(concatFilePath)
      .inputOptions(["-f concat", "-safe 0"])
      .outputOptions(["-c copy"])
      .output(trailerOutputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });

  logger.info("Trailer created", { trailerOutputPath });

  // Upload trailer to UploadThing
  const fileBuffer = await fs.readFile(trailerOutputPath);
  const fileName = `trailer_${videoId}_${Date.now()}.mp4`;

  return uploadFile(fileBuffer, fileName, FILE_TYPES.VIDEO);
}

/**
 * Create compressed version of the video
 */
async function compressVideo(videoPath: string, tempDirectory: string, videoId: number) {
  const outputPath = path.join(tempDirectory, `compressed_${videoId}.mp4`);

  await new Promise<void>((resolve, reject) => {
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
export const processVideoTask = task({
  id: "process-video",
  run: async (payload: ProcessVideoPayload) => {
    const { videoId, fileKey, videoUrl } = payload;

    // Update video status to processing
    await db
      .update(videos)
      .set({ status: "processing" })
      .where(and(eq(videos.id, videoId)));

    logger.info("Starting video processing", { videoId, videoUrl });

    // Create temporary directory for processing
    const tmpDir = path.join(os.tmpdir(), `video_processing_${videoId}_${Date.now()}`);
    await fs.mkdir(tmpDir, { recursive: true });

    try {
      // Fetch the video
      const response = await fetch(videoUrl);
      invariant(response.ok && response.body, "Failed to fetch video");

      // Download the video to a temporary file
      const videoPath = path.join(tmpDir, "original.mp4");
      const writeStream = await fs.open(videoPath, "w");
      const readableStream = Readable.from(response.body);

      // Setup a writable stream to save the file
      await new Promise<void>((resolve, reject) => {
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

      logger.info("Video downloaded to temporary file", { videoPath });

      // Get video information
      const { duration, width, height } = await probeVideo(videoPath);
      logger.info("Video info", { duration, width, height });

      // Tasks to execute
      const results = await Promise.allSettled([
        createPoster(videoPath, tmpDir, videoId),
        createWebVTT(videoPath, tmpDir, videoId, duration, width, height),
        createTrailer(videoPath, tmpDir, videoId, duration, width, height),
        compressVideo(videoPath, tmpDir, videoId),
      ]);

      // Process results and collect keys
      const keys: Record<string, string | undefined> = {
        poster_key: undefined,
        storyboard_key: undefined,
        thumbnail_key: undefined,
        trailer_key: undefined,
        compressed_key: undefined,
      };

      // Process each result
      if (results[0].status === "fulfilled") {
        keys.poster_key = results[0].value.key;
      } else {
        logger.error("Poster creation failed", { error: results[0].reason });
      }

      if (results[1].status === "fulfilled") {
        const webVttResult = results[1].value;
        keys.storyboard_key = webVttResult.storyboard_image.key;
        keys.thumbnail_key = webVttResult.thumbnails_vtt.key;
      } else {
        logger.error("Storyboard creation failed", { error: results[1].reason });
      }

      if (results[2].status === "fulfilled") {
        keys.trailer_key = results[2].value.key;
      } else {
        logger.error("Trailer creation failed", { error: results[2].reason });
      }

      if (results[3].status === "fulfilled") {
        keys.compressed_key = results[3].value.key;
      } else {
        logger.error("Compressed video creation failed", { error: results[3].reason });
      }

      // Update the video record with processing results and duration
      await db
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

      // Delete the original file from UploadThing now that we've processed it and saved the compressed version
      try {
        logger.info("Deleting original file from UploadThing", { fileKey });
        await utapi.deleteFiles(fileKey);
        logger.info("Successfully deleted original file");
      } catch (error) {
        // Don't fail the entire process if we can't delete the file
        logger.error("Failed to delete original file", { error: error });
      }

      logger.info("Video processing completed successfully", { videoId, resultKeys: keys });

      return { duration, ...keys };
    } catch (error) {
      logger.error("Error processing video", { error, videoId });

      // Update video status to failed
      await db
        .update(videos)
        .set({ status: "failed" })
        .where(and(eq(videos.id, videoId)));
    } finally {
      // Clean up temporary files
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  },
});

export type ProcessVideoTask = typeof processVideoTask;
