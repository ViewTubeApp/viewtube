import { task } from "@trigger.dev/sdk/v3";

import { createPoster } from "../lib/create-poster";

interface CreatePosterTaskPayload {
  file: string;
  dir: string;
  id: number;
}

// Subtask: Create a poster (thumbnail)
export const createPosterTask = task({
  id: "create-poster",
  run: async ({ file, dir, id }: CreatePosterTaskPayload) => {
    const result = await createPoster(file, dir, id);
    if (result.isErr()) {
      throw new Error(result.error.message);
    }

    return result.value;
  },
});
