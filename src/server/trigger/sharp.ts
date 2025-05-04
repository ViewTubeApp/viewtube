import { logger, task } from "@trigger.dev/sdk/v3";

import { cleanupImage } from "./lib/cleanup-image";
import { optimizeImage } from "./lib/optimize-image";
import { type ProcessImagePayload } from "./types";

export const optimizeImageTask = task({
  id: "optimize-image",
  machine: "large-2x",

  run: async (payload: ProcessImagePayload) => {
    const result = await optimizeImage(payload);

    if (result.isErr()) {
      logger.error("❌ Failed to optimize image", { error: result.error });
      throw new Error(`Failed to optimize image: ${result.error.message}`);
    }
  },

  cleanup: async (payload: ProcessImagePayload) => {
    const result = await cleanupImage(payload);

    if (result.isErr()) {
      logger.error("❌ Failed to cleanup image", { error: result.error });
      throw new Error(`Failed to cleanup image: ${result.error.message}`);
    }
  },
});

export type OptimizeImageTask = typeof optimizeImageTask;
