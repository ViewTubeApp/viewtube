import { logger, task } from "@trigger.dev/sdk/v3";

import { cleanupVideo } from "./lib/cleanup-video";
import { optimizeVideo } from "./lib/optimize-video";
import { type ProcessVideoPayload } from "./types";

export const optimizeVideoTask = task({
  id: "optimize-video",
  machine: "large-2x",

  run: async (payload: ProcessVideoPayload) => {
    const result = await optimizeVideo(payload);

    if (result.isErr()) {
      logger.error("❌ Failed to process video", { error: result.error });
      throw new Error(`Failed to process video: ${result.error.message}`);
    }
  },

  cleanup: async (payload: ProcessVideoPayload) => {
    const result = await cleanupVideo(payload);

    if (result.isErr()) {
      logger.error("❌ Failed to cleanup video", { error: result.error });
      throw new Error(`Failed to cleanup video: ${result.error.message}`);
    }
  },
});

export type OptimizeVideoTask = typeof optimizeVideoTask;
