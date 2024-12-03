import { db, redisSub, videoEvents, videoTasks } from "@/server/db";
import { log } from "@/lib/logger";
import path from "path";
import { videos } from "@/server/db/schema";
import { ilike } from "drizzle-orm";

export type TaskType = "poster" | "webvtt" | "trailer";

interface VideoCompletion {
  taskType: TaskType;
  filePath: string;
  outputPath: string;
  status: "completed";
}

async function handleRedisMessage(message: string) {
  try {
    const completion = JSON.parse(message) as VideoCompletion;
    const videoId = path.basename(path.dirname(completion.filePath));
    const tasks = videoTasks.get(videoId);

    if (!tasks) {
      log.warn(`Video ${videoId} has no tasks`);
      return;
    }

    tasks.delete(completion.taskType);
    log.info(`Video ${videoId} task completed: %s`, completion.taskType);

    // If all tasks are completed, update the database
    if (tasks.size !== 0) {
      log.info(`Video ${videoId} has remaining tasks: %o`, tasks);
      return;
    }

    const urlLike = ilike(videos.url, `%${videoId}%`);
    const video = await db.query.videos.findFirst({ where: urlLike });

    if (!video) {
      log.info(`Video ${videoId} processed before entity creation`);
      return;
    }

    // Update video record
    await db.update(videos).set({ processed: true }).where(urlLike);
    videoEvents.emit("videoProcessed", videoId);
    videoTasks.delete(videoId);

    log.info(`Video ${videoId} processing completed`);
  } catch (error) {
    log.error("Error handling completion message: %o", error);
  }
}

export async function registerVideoEvents() {
  try {
    await redisSub.subscribe("video_completions");
    redisSub.on("message", (_, message) => void handleRedisMessage(message));
  } catch (err) {
    log.error("Error registering video events: %o", err);
  }
}
