import { env } from "@/env";
import { deleteFileFromDisk, writeFileToDisk } from "@/utils/server/file";
import { perfAsync } from "@/utils/server/perf";
import { eq, inArray, sql } from "drizzle-orm";
import path from "path";
import "server-only";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { type CreateVideoTask, type TaskType, type VideoExtended, tags, videoTags, videoTasks, videos } from "@/server/db/schema";

import { AMQP } from "@/constants/amqp";
import { RELATED_LOAD_COUNT } from "@/constants/query";
import { TRAILER_CONFIG, type TrailerConfig, WEBVTT_CONFIG, type WebVTTConfig } from "@/constants/video";

interface MqVideoTaskConfig {
  webvtt?: WebVTTConfig;
  trailer?: TrailerConfig;
}

interface MqVideoTask {
  videoId: string;
  taskType: TaskType;
  filePath: string;
  outputPath: string;
  config?: MqVideoTaskConfig;
}

export const videoRouter = createTRPCRouter({
  getVideoList: publicProcedure
    .input(
      z.object({
        count: z.number().min(1).max(1024),
        query: z.string().optional().nullable(),
        status: z.array(z.enum(["completed", "processing", "failed", "pending"])).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return perfAsync("tRPC/video/getVideoList", () =>
        ctx.db.query.videos.findMany({
          limit: input.count,
          with: { videoTags: { with: { tag: true } }, modelVideos: { with: { model: true } } },
          where: (videos, { and, eq, ilike }) => {
            const onlyCompleted = eq(videos.status, "completed");
            const titleLike = ilike(videos.title, "%" + input.query + "%");
            const statusEq = input.status ? inArray(videos.status, input.status) : onlyCompleted;

            if (input.query) {
              return and(statusEq, titleLike);
            }

            return statusEq;
          },
          orderBy: (videos, { desc }) => [desc(videos.createdAt)],
        }),
      );
    }),

  getVideoById: publicProcedure
    .input(
      z.object({
        id: z.string(),
        shallow: z.boolean().optional(),
        related: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.transaction(
        async (tx) => {
          // Increment views count
          if (!input.shallow) {
            await perfAsync("tRPC/video/getVideoById/incrementViewsCount", () =>
              tx
                .update(videos)
                .set({ viewsCount: sql`${videos.viewsCount} + 1` })
                .where(eq(videos.id, input.id)),
            );
          }

          // Get video details
          const video = await perfAsync("tRPC/video/getVideoById/getVideoDetails", () =>
            tx.query.videos.findFirst({
              with: { videoTags: { with: { tag: true } }, modelVideos: { with: { model: true } } },
              where: (videos, { eq }) => eq(videos.id, input.id),
            }),
          );

          let related: VideoExtended[] = [];

          if (!input.related) {
            // Get related videos
            related = await perfAsync("tRPC/video/getVideoById/getRelatedVideos", () =>
              tx.query.videos.findMany({
                with: { videoTags: { with: { tag: true } }, modelVideos: { with: { model: true } } },
                where: (videos, { not, eq, and }) => and(not(eq(videos.id, input.id)), eq(videos.status, "completed")),
                orderBy: (videos, { desc }) => [desc(videos.createdAt)],
                limit: RELATED_LOAD_COUNT,
              }),
            );
          }

          return { video, related };
        },
        {
          accessMode: "read write",
          isolationLevel: "read committed",
        },
      );
    }),

  uploadVideo: publicProcedure
    .input(
      zfd.formData({
        file: zfd.file(),
        title: zfd.text(),
        description: zfd.text(z.string().optional()),
        tags: zfd.repeatableOfType(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const file = await perfAsync("tRPC/video/uploadVideo/writeFileToDisk", () => writeFileToDisk(input.file));

      const outputDir = path.dirname(file.path);
      const videoId = path.basename(outputDir);

      await ctx.db.transaction(
        async (tx) => {
          // Create video record
          const [createdVideo] = await perfAsync("tRPC/video/uploadVideo/createVideoRecord", () =>
            tx
              .insert(videos)
              .values({
                id: videoId,
                url: file.url,
                status: "pending",
                title: input.title,
                description: input.description,
              })
              .returning({ id: videos.id }),
          );

          if (!createdVideo) {
            throw new Error("Failed to create video record");
          }

          // Create task records
          const dbTasks: CreateVideoTask[] = [
            {
              videoId: createdVideo.id,
              taskType: "poster",
              status: "pending",
            },
            {
              videoId: createdVideo.id,
              taskType: "webvtt",
              status: "pending",
            },
            {
              videoId: createdVideo.id,
              taskType: "trailer",
              status: "pending",
            },
            {
              videoId: createdVideo.id,
              taskType: "duration",
              status: "pending",
            },
          ];

          // Insert tasks into database
          await perfAsync("tRPC/video/uploadVideo/insertTasks", () => tx.insert(videoTasks).values(dbTasks));

          if (input.tags) {
            // Get existing tags
            const existingTags = await perfAsync("tRPC/video/uploadVideo/getExistingTags", () =>
              tx.select({ id: tags.id }).from(tags).where(inArray(tags.name, input.tags!)),
            );

            // Create new tags
            const newTags = await perfAsync("tRPC/video/uploadVideo/createNewTags", () =>
              tx
                .insert(tags)
                .values(input.tags!.map((tag) => ({ name: tag })))
                .returning({ id: tags.id })
                .onConflictDoNothing(),
            );

            // Combine existing and new tags
            const allTags = [...existingTags, ...(newTags ?? [])];

            // Create video-tag relations
            await perfAsync("tRPC/video/uploadVideo/createVideoTags", () =>
              tx.insert(videoTags).values(
                allTags.map((tag) => ({
                  tagId: tag.id,
                  videoId: createdVideo.id,
                })),
              ),
            );
          }
        },
        {
          accessMode: "read write",
          isolationLevel: "repeatable read",
        },
      );

      // Prepare tasks for RabbitMQ
      const mqTasks: MqVideoTask[] = [
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
          config: { trailer: TRAILER_CONFIG },
        },
        {
          videoId,
          taskType: "duration",
          filePath: file.path,
          outputPath: outputDir,
        },
      ];

      // Publish each task individually
      await Promise.all(
        mqTasks.map((task) =>
          ctx.amqp.pub.publish(AMQP.exchange, `video.task.${task.taskType}`, Buffer.from(JSON.stringify(task)), {
            persistent: true,
          }),
        ),
      );

      return { file };
    }),

  updateVideo: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        tags: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        // Get current video status
        const currentVideo = await perfAsync("tRPC/video/updateVideo/getVideoById", () =>
          tx.query.videos.findFirst({
            where: (videos, { eq }) => eq(videos.id, input.id),
            columns: {
              status: true,
            },
          }),
        );

        if (!currentVideo) {
          throw new Error("Video not found");
        }

        // Don't allow updates while video is processing
        if (currentVideo.status === "processing") {
          throw new Error("Cannot update video while it's being processed");
        }

        // Update video details
        await perfAsync("tRPC/video/updateVideo/updateVideoDetails", () =>
          tx
            .update(videos)
            .set({
              title: input.title,
              description: input.description,
            })
            .where(eq(videos.id, input.id)),
        );

        // Delete existing tags
        await perfAsync("tRPC/video/updateVideo/deleteExistingTags", () => tx.delete(videoTags).where(eq(videoTags.videoId, input.id)));

        // Insert new tags
        const existingTags = await perfAsync("tRPC/video/updateVideo/getExistingTags", () =>
          tx.select({ id: tags.id, name: tags.name }).from(tags).where(inArray(tags.name, input.tags)),
        );

        const existingTagNames = existingTags.map((tag) => tag.name);
        const newTagNames = input.tags.filter((tag) => !existingTagNames.includes(tag));

        // Create new tags
        const newTags = await perfAsync("tRPC/video/updateVideo/createNewTags", () =>
          Promise.all(newTagNames.map((name) => tx.insert(tags).values({ name }).returning({ id: tags.id, name: tags.name }))),
        );

        // Insert video tags
        const allTags = [...existingTags, ...newTags.map((result) => result[0]!)];
        await perfAsync("tRPC/video/updateVideo/insertVideoTags", () =>
          Promise.all(
            allTags.map((tag) =>
              tx.insert(videoTags).values({
                tagId: tag.id,
                videoId: input.id,
              }),
            ),
          ),
        );

        const video = await perfAsync("tRPC/video/updateVideo/getVideoById", () =>
          tx.query.videos.findFirst({
            where: (videos, { eq }) => eq(videos.id, input.id),
            with: { videoTags: { with: { tag: true } }, modelVideos: { with: { model: true } } },
          }),
        );

        return video;
      });
    }),

  deleteVideo: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await perfAsync("tRPC/video/deleteVideo/deleteFileFromDisk", () => deleteFileFromDisk(path.join(env.UPLOADS_VOLUME, input.id)));
      await perfAsync("tRPC/video/deleteVideo/deleteVideo", () => ctx.db.delete(videos).where(eq(videos.id, input.id)));
    }),
});
