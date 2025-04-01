import { ffprobe } from "fluent-ffmpeg";
import { type Result, ResultAsync } from "neverthrow";

import { type VideoProcessingError } from "../types";

interface VideoInfo {
  duration: number;
  width: number;
  height: number;
}

/**
 * Get video information using ffprobe
 */
export async function probeVideo(path: string): Promise<Result<VideoInfo, VideoProcessingError>> {
  const promise = new Promise<VideoInfo>((resolve, reject) => {
    ffprobe(path, (err, metadata) => {
      if (err) {
        return reject(err);
      }

      // Get video stream information
      const stream = metadata.streams.find((stream) => stream.codec_type === "video");
      if (!stream) {
        return reject(new Error("No video stream found"));
      }

      // Get duration from format
      const duration = parseFloat(metadata.format.duration?.toString() || "0");
      const width = parseInt(stream.width?.toString() || "0", 10);
      const height = parseInt(stream.height?.toString() || "0", 10);

      if (isNaN(duration) || isNaN(width) || isNaN(height)) {
        return reject(new Error("Invalid video dimensions or duration"));
      }

      resolve({ duration, width, height });
    });
  });

  return ResultAsync.fromPromise(promise, (error) => ({
    type: "PROBE_ERROR" as const,
    message: `❌ Failed to get video information: ${error}`,
  }));
}
