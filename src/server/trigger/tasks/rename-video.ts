import { task } from "@trigger.dev/sdk/v3";

import { renameVideo } from "../lib/rename-video";

interface RenameVideoTaskPayload {
  fileKey: string;
  id: number;
}

// Subtask: Rename the original video file in storage
export const renameVideoTask = task({
  id: "rename-video",
  run: async ({ fileKey, id }: RenameVideoTaskPayload) => {
    const result = await renameVideo(fileKey, id);
    if (result.isErr()) {
      throw new Error(result.error.message);
    }

    return result.value;
  },
});
