import { task } from "@trigger.dev/sdk/v3";

import { createWebVTT } from "../lib/create-web-vtt";

interface CreateWebVTTTaskPayload {
  file: string;
  dir: string;
  id: number;
  duration: number;
  portrait: boolean;
}

// Subtask: Create WebVTT storyboard (thumbnails and VTT)
export const createWebVTTTask = task({
  id: "create-webvtt",
  run: async ({ file, dir, id, duration, portrait }: CreateWebVTTTaskPayload) => {
    const result = await createWebVTT(file, dir, id, duration, portrait);
    if (result.isErr()) {
      throw new Error(result.error.message);
    }

    return result.value;
  },
});
