import { db } from "@/server/db";
import { log } from "@/server/logger";
import path from "path";
import { videos } from "@/server/db/schema";
import { ilike } from "drizzle-orm";
import { videoEvents } from "@/server/video";
import { redisSub, videoTasks } from "@/server/redis";
import chalk from "chalk";

export type TaskType = "poster" | "webvtt" | "trailer";

interface VideoCompletion {
  taskType: TaskType;
  filePath: string;
  outputPath: string;
  status: "completed";
}

export async function registerVideoEvents() {
  try {
    await redisSub.subscribe("video_completions");
    redisSub.on("message", (_, message) => void handleRedisMessage(message));
  } catch (err) {
    log.error("Error registering video events: %o", err);
  }
}

async function handleRedisMessage(message: string) {
  try {
    const completion = JSON.parse(message) as VideoCompletion;
    const videoId = path.basename(path.dirname(completion.filePath));
    const tasksList = JSON.parse((await videoTasks.get(videoId)) ?? "[]") as string[];
    const tasks = new Set(tasksList);

    if (tasks.size === 0) {
      log.debug(`Video ${chalk.red(`"${videoId}"`)} has no tasks`);
      return;
    }

    tasks.delete(completion.taskType);
    await videoTasks.set(videoId, JSON.stringify(Array.from(tasks)));
    log.debug(`Video ${chalk.red(`"${videoId}"`)} task completed: %s`, chalk.green(completion.taskType));

    // If all tasks are completed, update the database
    if (tasks.size !== 0) {
      log.debug(`Video ${chalk.red(`"${videoId}"`)} has remaining tasks: %s`, chalk.yellow(Array.from(tasks.values()).join(", ")));
      return;
    }

    const urlLike = ilike(videos.url, `%${videoId}%`);
    const video = await db.query.videos.findFirst({ where: urlLike });

    if (!video) {
      log.debug(`Video ${chalk.red(`"${videoId}"`)} processed before entity creation`);
      return;
    }

    // Update video record
    await db.update(videos).set({ processed: true }).where(urlLike);
    videoEvents.emit("video_processed", videoId);
    await videoTasks.del(videoId);

    log.debug(`Video ${chalk.red(`"${videoId}"`)} processing completed`);
  } catch (error) {
    log.error("Error handling completion message: %o", error);
  }
}
