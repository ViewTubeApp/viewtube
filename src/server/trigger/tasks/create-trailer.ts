import { task } from "@trigger.dev/sdk/v3";

import { createTrailer } from "../lib/create-trailer";

interface CreateTrailerTaskPayload {
  file: string;
  dir: string;
  id: number;
  duration: number;
  width: number;
  height: number;
}

// Subtask: Create a video trailer
export const createTrailerTask = task({
  id: "create-trailer",
  run: async ({ file, dir, id, duration, width, height }: CreateTrailerTaskPayload) => {
    const result = await createTrailer(file, dir, id, duration, width, height);
    if (result.isErr()) {
      throw new Error(result.error.message);
    }

    return result.value;
  },
});
