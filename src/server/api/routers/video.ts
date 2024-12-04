import "server-only";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { videos } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { zfd } from "zod-form-data";
import { writeFileToDisk } from "@/lib/file";
import { RELATED_LOAD_COUNT } from "@/constants/shared";
import path from "path";
import { on } from "events";
import { zAsyncIterable } from "@/lib/zod";
import { match } from "ts-pattern";
import { WEBVTT_CONFIG, type WebVTTConfig } from "@/constants/video";
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

// Subscribe to video processing completions

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
      const videoTask = JSON.parse((await ctx.videoTasks.get(videoId)) ?? "[]") as string[];

      await ctx.db.insert(videos).values({
        url: input.url,
        title: input.title,
        processed: match(videoTask)
          .with([], () => true)
          .otherwise(() => false),
      });

      if (videoTask.length === 0) {
        ctx.videoEvents.emit("video_processed", videoId);
        await ctx.videoTasks.del(videoId);
      }
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
  onProcessed: publicProcedure
    .output(
      zAsyncIterable({
        yield: z.object({
          videoId: z.string(),
        }),
      }),
    )
    .subscription(async function* ({ ctx, signal }) {
      for await (const [data] of on(ctx.videoEvents, "video_processed", { signal })) {
        const videoId: string = data as string;
        yield { videoId };
      }
    }),

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
      const taskTypes = ["poster", "webvtt", "trailer"] as const;
      await ctx.videoTasks.set(videoId, JSON.stringify(taskTypes));

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

      for (const task of tasks) {
        try {
          await ctx.redisPub.publish("video_tasks", JSON.stringify(task));
          ctx.log.debug(`Published ${chalk.red(`"${task.taskType}"`)} task for processing`);
        } catch (err) {
          ctx.log.error(`Failed to publish ${chalk.red(`"${task.taskType}"`)} task: %o`, err);
        }
      }

      return { file };
    }),
});
