import { logger } from "@trigger.dev/sdk/v3";
import { and, eq } from "drizzle-orm";
import { type Result, ResultAsync, err, ok } from "neverthrow";
import fetch from "node-fetch";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";

import { db } from "../../db";
import { videos } from "../../db/schema";
import { type ProcessVideoPayload, type VideoProcessingError } from "../types";
import { renameVideo } from "./compress-video";
import { createPoster } from "./create-poster";
import { createTrailer } from "./create-trailer";
import { createWebVTT } from "./create-web-vtt";
import { probeVideo } from "./probe-video";

/**
 * Process a video - create poster, storyboard (WebVTT), trailer, and update video metadata
 */
export async function optimizeVideo(payload: ProcessVideoPayload): Promise<Result<void, VideoProcessingError>> {
  const { id: video_id, url: video_url } = payload;

  // Update video status to processing
  {
    const promise = db
      .update(videos)
      .set({ status: "processing" })
      .where(and(eq(videos.id, video_id)));

    const result = await ResultAsync.fromPromise(promise, (error) => ({
      type: "DATABASE_ERROR" as const,
      message: `❌ Failed to update video status: ${error}`,
    }));

    if (result.isErr()) {
      return err(result.error);
    }
  }

  logger.info("🎥 Starting video processing", { videoId: video_id, videoUrl: video_url });
  const tmpdir = path.join(os.tmpdir(), `video_processing_${video_id}_${Date.now()}`);

  // Create temporary directory for processing
  {
    const result = await ResultAsync.fromPromise(fs.mkdir(tmpdir, { recursive: true }), (error) => ({
      type: "FILE_SYSTEM_ERROR" as const,
      message: `❌ Failed to create temporary directory: ${error}`,
    }));

    if (result.isErr()) {
      return err(result.error);
    }
  }

  // Fetch the video
  const response = await fetch(video_url);
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
    message: `❌ Failed to download video: ${error}`,
  }));

  if (result.isErr()) {
    return err(result.error);
  }

  logger.info("💾 Video downloaded to temporary file", { videoPath });

  // Get video information
  const videoInfoResult = await probeVideo(videoPath);
  if (videoInfoResult.isErr()) {
    return err(videoInfoResult.error);
  }

  const { duration, width, height } = videoInfoResult.value;
  logger.info("🎥 Video info", { duration, width, height });

  // Tasks to execute
  logger.info("🎥 Creating poster");
  const posterResult = await createPoster(videoPath, tmpdir, video_id);
  if (posterResult.isErr()) return err(posterResult.error);
  logger.info("✅ Poster created", { ...posterResult.value });

  logger.info("🎥 Creating webvtt");
  const webVttResult = await createWebVTT(videoPath, tmpdir, video_id, duration, height > width);
  if (webVttResult.isErr()) return err(webVttResult.error);
  logger.info("✅ WebVTT created", { ...webVttResult.value });

  logger.info("🎥 Creating trailer");
  const trailerResult = await createTrailer(videoPath, tmpdir, video_id, duration, width, height);
  if (trailerResult.isErr()) return err(trailerResult.error);
  logger.info("✅ Trailer created", { ...trailerResult.value });

  logger.info("🎥 Renaming video");
  const renamedResult = await renameVideo(videoPath, video_id);
  if (renamedResult.isErr()) return err(renamedResult.error);
  logger.info("✅ Renamed video", { ...renamedResult.value });

  // All tasks succeeded, collect keys
  const keys = {
    poster_key: posterResult.value.key,
    video_key: renamedResult.value.key,
    storyboard_key: webVttResult.value.storyboard_image.key,
    thumbnail_key: webVttResult.value.thumbnails_vtt.key,
    trailer_key: trailerResult.value.key,
  } as const;

  logger.info("✅ Processing results", { keys });

  // Update the video record with processing results and duration
  {
    const promise = db
      .update(videos)
      .set({
        status: "completed" as const,
        file_key: keys.video_key,
        poster_key: keys.poster_key,
        trailer_key: keys.trailer_key,
        thumbnail_key: keys.thumbnail_key,
        storyboard_key: keys.storyboard_key,
        processing_completed_at: new Date(),
        video_duration: Math.floor(duration),
      })
      .where(and(eq(videos.id, video_id)));

    {
      const result = await ResultAsync.fromPromise(promise, (error) => ({
        type: "DATABASE_ERROR" as const,
        message: `❌ Failed to update video status: ${error}`,
      }));

      if (result.isErr()) {
        return err(result.error);
      }
    }

    logger.info("✅ Video processing completed successfully", { videoId: video_id, resultKeys: keys });

    return ok();
  }
}
