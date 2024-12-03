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

type TaskType = "poster" | "webvtt" | "trailer";

type VideoTaskConfig = {
  webvtt?: {
    interval: number;
    numColumns: number;
    width: number;
    height: number;
  };
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
      const videoTask = ctx.videoTasks.get(videoId);

      await ctx.db.insert(videos).values({
        url: input.url,
        title: input.title,
        processed: videoTask?.size === 0 ?? true,
      });

      if (videoTask?.size === 0) {
        ctx.videoEvents.emit("videoProcessed", videoId);
        ctx.videoTasks.delete(videoId);
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
            where: (videos, { not, eq }) => not(eq(videos.id, input.id)),
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
      for await (const [data] of on(ctx.videoEvents, "videoProcessed", { signal })) {
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
      ctx.videoTasks.set(videoId, new Set(taskTypes));

      // Send tasks to Hermes for processing
      const tasks: VideoTask[] = [
        { taskType: "poster", filePath: file.path, outputPath: outputDir, videoId },
        {
          taskType: "webvtt",
          filePath: file.path,
          outputPath: outputDir,
          videoId,
          config: {
            webvtt: {
              interval: 1,
              numColumns: 5,
              width: 160,
              height: 90,
            },
          },
        },
        { taskType: "trailer", filePath: file.path, outputPath: outputDir, videoId },
      ];

      for (const task of tasks) {
        try {
          await ctx.redisPub.publish("video_tasks", JSON.stringify(task));
          ctx.log.debug(`Published ${task.taskType} task for processing`);
        } catch (err) {
          ctx.log.error(`Failed to publish ${task.taskType} task: %o`, err);
        }
      }

      return { file };
    }),
});
