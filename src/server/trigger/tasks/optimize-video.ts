import { batch, logger, task } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import fetch from "node-fetch";
import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import { db } from "../../db";
import { videos } from "../../db/schema";
import { probeVideo } from "../lib/probe-video";
import { type ProcessVideoPayload } from "../types";
import { createPosterTask } from "./create-poster";
import { createTrailerTask } from "./create-trailer";
import { createWebVTTTask } from "./create-webvtt";
import { renameVideoTask } from "./rename-video";

export const optimizeVideoTask = task({
  id: "optimize-video",
  machine: "large-2x",

  run: async (payload: ProcessVideoPayload) => {
    const { id: videoId, url: videoUrl, file_key: fileKey } = payload;

    // [1] Update video status to processing
    await db.update(videos).set({ status: "processing" }).where(eq(videos.id, videoId));

    logger.info("Starting video processing", { videoId, videoUrl });

    // [2] Prepare temporary directory and download video
    const tmpdir = path.join(os.tmpdir(), `video_processing_${videoId}_${Date.now()}`);
    await fs.mkdir(tmpdir, { recursive: true });

    const response = await fetch(videoUrl);
    if (!response.ok || !response.body) {
      throw new Error("Failed to fetch video");
    }

    const videoPath = path.join(tmpdir, "original.mp4");
    const writeStream = createWriteStream(videoPath);
    const readableStream = Readable.from(response.body);
    await pipeline(readableStream, writeStream);

    // [3] Probe video for metadata
    const videoInfoResult = await probeVideo(videoPath);
    if (videoInfoResult.isErr()) {
      throw new Error(videoInfoResult.error.message);
    }

    const { duration, width, height } = videoInfoResult.value;
    const portrait = height > width;

    // [4] Trigger subtasks in parallel using batch.triggerAndWait by task IDs
    const responses = await batch.triggerAndWait<
      typeof createPosterTask | typeof createWebVTTTask | typeof createTrailerTask | typeof renameVideoTask
    >([
      { id: createPosterTask.id, payload: { file: videoPath, dir: tmpdir, id: videoId } },
      { id: createWebVTTTask.id, payload: { file: videoPath, dir: tmpdir, id: videoId, duration, portrait } },
      { id: createTrailerTask.id, payload: { file: videoPath, dir: tmpdir, id: videoId, duration, width, height } },
      { id: renameVideoTask.id, payload: { fileKey, id: videoId } },
    ]);

    const poster = responses.runs.find((run) => run.taskIdentifier === createPosterTask.id);
    const webvtt = responses.runs.find((run) => run.taskIdentifier === createWebVTTTask.id);
    const trailer = responses.runs.find((run) => run.taskIdentifier === createTrailerTask.id);

    // [5] Collect keys and update database
    const keys = {
      poster_key: poster?.ok ? poster.output.key : null,
      storyboard_key: webvtt?.ok ? webvtt.output.storyboard_image.key : null,
      thumbnail_key: webvtt?.ok ? webvtt.output.thumbnails_vtt.key : null,
      trailer_key: trailer?.ok ? trailer.output.key : null,
    };

    await db
      .update(videos)
      .set({
        status: "completed",
        poster_key: keys.poster_key,
        trailer_key: keys.trailer_key,
        thumbnail_key: keys.thumbnail_key,
        storyboard_key: keys.storyboard_key,
        processing_completed_at: new Date(),
        video_duration: Math.floor(duration),
      })
      .where(eq(videos.id, videoId));

    logger.info("Video processing completed successfully", { videoId, keys });
  },
});

export type OptimizeVideoTask = typeof optimizeVideoTask;
