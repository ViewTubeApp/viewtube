import { logger, task } from "@trigger.dev/sdk/v3";

import { cleanupVideo } from "./lib/cleanup-video";
import { processVideo } from "./lib/process-video";
import { type ProcessVideoPayload } from "./types";

export const process = task({
  id: "process-video",
  machine: "small-2x",
  description:
    "Process uploaded video by generating poster, storyboard, trailer, and compressed version while managing file storage and database updates",

  run: async (payload: ProcessVideoPayload) => {
    const result = await processVideo(payload);

    if (result.isErr()) {
      logger.error("❌ Failed to process video", { error: result.error });
      throw new Error(`Failed to process video: ${result.error}`);
    }
  },

  cleanup: async (payload: ProcessVideoPayload) => {
    const result = await cleanupVideo(payload);

    if (result.isErr()) {
      logger.error("❌ Failed to cleanup video", { error: result.error });
      throw new Error(`Failed to cleanup video: ${result.error}`);
    }
  },
});

export type ProcessVideoTask = typeof process;
