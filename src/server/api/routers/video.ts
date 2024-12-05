import "server-only";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { videos } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { zfd } from "zod-form-data";
import { writeFileToDisk } from "@/lib/file";
import { RELATED_LOAD_COUNT } from "@/constants/shared";
import path from "path";
import { match } from "ts-pattern";
import { TASK_MAX_RETRIES, TASK_RETRY_DELAY, WEBVTT_CONFIG, type WebVTTConfig } from "@/constants/video";
import chalk from "chalk";

type TaskType = "poster" | "webvtt" | "trailer";

type VideoTaskConfig = {
  webvtt?: WebVTTConfig;
};

interface VideoTask {
  videoId?: string;
  taskType: TaskType;
  filePath: string;
  outputPath: string;
  config?: VideoTaskConfig;
}

export const videoRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        url: z.string(),
        title: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const videoId = path.basename(path.dirname(input.url));
      const videoTask = await ctx.redis.smembers(videoId);

      await ctx.db.insert(videos).values({
        url: input.url,
        title: input.title,
        processed: match(videoTask)
          .with([], () => true)
          .otherwise(() => false),
      });
    }),

  latest: publicProcedure
    .input(
      z.object({
        query: z.string().optional().nullable(),
        count: z.number().min(1).max(1024),
      }),
    )
    .query(async ({ ctx, input }) => {
      const params: Parameters<Awaited<typeof ctx.db.query.videos.findMany>>[0] = {
        limit: input.count,
        where: (videos, { and, eq, ilike }) => {
          const onlyProcessed = eq(videos.processed, true);
          const titleLike = ilike(videos.title, "%" + input.query + "%");

          if (input.query) {
            return and(onlyProcessed, titleLike);
          }

          return onlyProcessed;
        },
        orderBy: (videos, { desc }) => [desc(videos.createdAt)],
      };

      const videos = await ctx.db.query.videos.findMany(params);

      return videos ?? [];
    }),

  one: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.transaction(
        async (tx) => {
          await tx
            .update(videos)
            .set({ viewsCount: sql`${videos.viewsCount} + 1` })
            .where(eq(videos.id, input.id));

          const video = await tx.query.videos.findFirst({
            where: (videos, { eq }) => eq(videos.id, input.id),
          });

          const related = await tx.query.videos.findMany({
            where: (videos, { not, eq, and }) => and(not(eq(videos.id, input.id)), eq(videos.processed, true)),
            orderBy: (videos, { desc }) => [desc(videos.createdAt)],
            limit: RELATED_LOAD_COUNT,
          });

          return { video, related };
        },
        { isolationLevel: "read committed", accessMode: "read write" },
      );
    }),

  // Add subscription endpoint for client notifications
  // onProcessed: publicProcedure
  //   .output(
  //     zAsyncIterable({
  //       yield: z.object({
  //         videoId: z.string(),
  //       }),
  //     }),
  //   )
  //   .subscription(async function* ({ ctx, signal }) {
  //     while (true) {
  //       try {
  //         // Check if the subscription has been cancelled
  //         if (signal?.aborted) {
  //           break;
  //         }

  //         // Use LRANGE to get all messages without removing them
  //         const messages = await ctx.subRedis.lrange("video_completions", 0, -1);

  //         // Define completion message schema
  //         const completionSchema = z.object({
  //           taskType: z.enum(["poster", "webvtt", "trailer"]),
  //           filePath: z.string(),
  //           outputPath: z.string(),
  //           status: z.string(),
  //           videoId: z.string(),
  //         });

  //         // Process each message
  //         for (const message of messages) {
  //           try {
  //             const completion = completionSchema.parse(JSON.parse(message));
  //             yield { videoId: completion.videoId };
  //           } catch (error) {
  //             ctx.log.error("Error parsing completion message: %o", error);
  //           }
  //         }
  //       } catch (error) {
  //         ctx.log.error("Error in video subscription: %o", error);
  //       }

  //       // Small sleep to avoid tight polling
  //       await new Promise((resolve) => setTimeout(resolve, 1000));
  //     }
  //   }),

  upload: publicProcedure
    .input(
      zfd.formData({
        file: zfd.file(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const t1 = performance.now();
      const file = await writeFileToDisk(input.file);
      const t2 = performance.now() - t1;
      ctx.log.debug(`File saved in ${t2}ms`);

      const outputDir = path.dirname(file.path);
      const videoId = path.basename(outputDir);

      // Initialize pending tasks for this video
      const taskTypes = ["poster", "webvtt", "trailer"];
      await ctx.redis.sadd(videoId, taskTypes);

      // Send tasks to Hermes for processing
      const tasks: VideoTask[] = [
        {
          videoId,
          taskType: "poster",
          filePath: file.path,
          outputPath: outputDir,
        },
        {
          videoId,
          taskType: "webvtt",
          filePath: file.path,
          outputPath: outputDir,
          config: { webvtt: WEBVTT_CONFIG },
        },
        {
          videoId,
          taskType: "trailer",
          filePath: file.path,
          outputPath: outputDir,
        },
      ];

      async function publishTaskWithRetry(task: VideoTask) {
        for (let i = 0; i < TASK_MAX_RETRIES; i++) {
          try {
            ctx.log.debug(`Published ${chalk.red(`"${task.taskType}"`)} task for video ${chalk.red(`"${videoId}"`)}`);
            await ctx.redis.lpush("video_tasks", JSON.stringify(task));
            return;
          } catch (err) {
            if (i === TASK_MAX_RETRIES - 1) throw err;
            await new Promise((resolve) => setTimeout(resolve, TASK_RETRY_DELAY));
          }
        }
      }

      await Promise.all(tasks.map(publishTaskWithRetry));
      return { file };
    }),
});
