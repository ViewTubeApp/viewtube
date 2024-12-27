import { env } from "@/env";
import { deleteFileFromDisk, writeFileToDisk } from "@/utils/server/file";
import { perfAsync } from "@/utils/server/perf";
import { type inferTransformedProcedureOutput } from "@trpc/server";
import { type SQL, eq, inArray, sql } from "drizzle-orm";
import path from "path";
import "server-only";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  type CreateVideoTask,
  type TaskType,
  categories,
  categoryVideos,
  tags,
  videoTags,
  videoTasks,
  videos,
} from "@/server/db/schema";

import { AMQP } from "@/constants/amqp";
import { TRAILER_CONFIG, type TrailerConfig, WEBVTT_CONFIG, type WebVTTConfig } from "@/constants/video";

const getVideoListSchema = z.object({
  pageSize: z.number().min(1).max(1024).default(32).optional(),
  pageOffset: z.number().min(0).max(1024).default(0).optional(),
  query: z.string().optional().nullable(),
  status: z.array(z.enum(["completed", "processing", "failed", "pending"])).optional(),
});

export type GetVideoListSchema = z.infer<typeof getVideoListSchema>;

const getVideoByIdSchema = z.object({
  id: z.string(),
  shallow: z.boolean().optional(),
  related: z.boolean().optional(),
});

export type GetVideoByIdSchema = z.infer<typeof getVideoByIdSchema>;

const uploadVideoSchema = zfd.formData({
  file: zfd.file(),
  title: zfd.text(),
  description: zfd.text(z.string().optional()),
  tags: zfd.repeatableOfType(z.string()).optional(),
  categories: zfd.repeatableOfType(z.string()).optional(),
});

export type UploadVideoSchema = z.infer<typeof uploadVideoSchema>;

export const updateVideoSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  tags: z.array(z.string()),
  description: z.string().optional(),
  categories: z.array(z.string()).optional(),
});

export type UpdateVideoSchema = z.infer<typeof updateVideoSchema>;

export const deleteVideoSchema = z.object({
  id: z.string(),
});

export type DeleteVideoSchema = z.infer<typeof deleteVideoSchema>;

export const videoRouter = createTRPCRouter({
  getVideoList: publicProcedure.input(getVideoListSchema).query(async ({ ctx, input }) => {
    return perfAsync("tRPC/video/getVideoList", () => {
      return ctx.db.query.videos.findMany({
        limit: input.pageSize,
        with: {
          videoTags: { with: { tag: true } },
          modelVideos: { with: { model: true } },
          categoryVideos: { with: { category: true } },
        },
        where: (videos, { and, eq, ilike, or, exists }) => {
          const args: Array<SQL | undefined> = [];

          if (input.query) {
            const tagQuery = ctx.db
              .select()
              .from(tags)
              .where(and(eq(tags.id, videoTags.tagId), ilike(tags.name, "%" + input.query + "%")));

            const categoryQuery = ctx.db
              .select()
              .from(categories)
              .where(
                and(eq(categories.id, categoryVideos.categoryId), ilike(categories.slug, "%" + input.query + "%")),
              );

            args.push(
              or(
                // Filter by title
                ilike(videos.title, "%" + input.query + "%"),
                // Filter by description
                ilike(videos.description, "%" + input.query + "%"),
                // Filter by tag name
                exists(
                  ctx.db
                    .select()
                    .from(videoTags)
                    .where(and(eq(videoTags.videoId, videos.id), exists(tagQuery))),
                ),
                // Filter by category name
                exists(
                  ctx.db
                    .select()
                    .from(categoryVideos)
                    .where(and(eq(categoryVideos.videoId, videos.id), exists(categoryQuery))),
                ),
              ),
            );
          }

          if (input.status) {
            args.push(inArray(videos.status, input.status));
          } else {
            args.push(eq(videos.status, "completed"));
          }

          return and(...args);
        },
        orderBy: (videos, { desc }) => [desc(videos.createdAt)],
      });
    });
  }),

  getVideoById: publicProcedure.input(getVideoByIdSchema).query(async ({ ctx, input }) => {
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
            with: {
              videoTags: { with: { tag: true } },
              modelVideos: { with: { model: true } },
              categoryVideos: { with: { category: true } },
            },
            where: (videos, { eq }) => eq(videos.id, input.id),
          }),
        );

        if (!input.related) {
          // Get related videos
          const related = await perfAsync("tRPC/video/getVideoById/getRelatedVideos", () =>
            tx.query.videos.findMany({
              limit: 32,
              with: {
                videoTags: { with: { tag: true } },
                modelVideos: { with: { model: true } },
                categoryVideos: { with: { category: true } },
              },
              orderBy: (videos, { desc }) => [desc(videos.createdAt)],
              where: (videos, { not, eq, and }) => and(not(eq(videos.id, input.id)), eq(videos.status, "completed")),
            }),
          );

          return { video, related };
        }

        return { video, related: [] };
      },
      {
        accessMode: "read write",
        isolationLevel: "read committed",
      },
    );
  }),

  uploadVideo: publicProcedure.input(uploadVideoSchema).mutation(async ({ ctx, input }) => {
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

        if (input.categories) {
          // Create video-category relations
          await perfAsync("tRPC/video/uploadVideo/createVideoCategories", () =>
            tx
              .insert(categoryVideos)
              .values(input.categories!.map((category) => ({ categoryId: category, videoId: createdVideo.id }))),
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

  updateVideo: publicProcedure.input(updateVideoSchema).mutation(async ({ ctx, input }) => {
    return ctx.db.transaction(async (tx) => {
      // Get current video status
      const currentVideo = await perfAsync("tRPC/video/updateVideo/getVideoById", () =>
        tx.query.videos.findFirst({
          where: (videos, { eq }) => eq(videos.id, input.id),
          columns: { status: true },
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
      await perfAsync("tRPC/video/updateVideo/deleteExistingTags", () =>
        tx.delete(videoTags).where(eq(videoTags.videoId, input.id)),
      );

      // Insert new tags
      const existingTags = await perfAsync("tRPC/video/updateVideo/getExistingTags", () =>
        tx.select({ id: tags.id, name: tags.name }).from(tags).where(inArray(tags.name, input.tags)),
      );

      const existingTagNames = existingTags.map((tag) => tag.name);
      const newTagNames = input.tags.filter((tag) => !existingTagNames.includes(tag));

      // Create new tags
      const newTags = await perfAsync("tRPC/video/updateVideo/createNewTags", () =>
        Promise.all(
          newTagNames.map((name) => tx.insert(tags).values({ name }).returning({ id: tags.id, name: tags.name })),
        ),
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

      // Update categories
      const videoCategories = await perfAsync("tRPC/video/updateVideo/getVideoCategories", () =>
        tx.query.categoryVideos.findMany({
          where: (categoryVideos, { eq }) => eq(categoryVideos.videoId, input.id),
        }),
      );

      const existingCategoryIds = videoCategories.map((category) => category.categoryId);
      const newCategoryIds = input.categories!.filter((category) => !existingCategoryIds.includes(category));

      // Insert new categories
      await perfAsync("tRPC/video/updateVideo/insertCategories", () =>
        Promise.all(
          newCategoryIds.map((category) =>
            tx.insert(categoryVideos).values({ categoryId: category, videoId: input.id }),
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

  deleteVideo: publicProcedure.input(deleteVideoSchema).mutation(async ({ ctx, input }) => {
    await perfAsync("tRPC/video/deleteVideo/deleteFileFromDisk", () =>
      deleteFileFromDisk(path.join(env.UPLOADS_VOLUME, input.id)),
    );
    await perfAsync("tRPC/video/deleteVideo/deleteVideo", () => ctx.db.delete(videos).where(eq(videos.id, input.id)));
  }),
});

export type VideoListResponse = inferTransformedProcedureOutput<typeof videoRouter, typeof videoRouter.getVideoList>;
export type VideoResponse = VideoListResponse[number];
