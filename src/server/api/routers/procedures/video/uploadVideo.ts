import { env } from "@/env";
import { writeFile } from "@/utils/server/file";
import { inArray } from "drizzle-orm";
import path from "path";
import "server-only";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { publicProcedure } from "@/server/api/trpc";
import {
  type DBCreateVideoTaskSchema,
  type VideoTaskType,
  categoryVideos,
  modelVideos,
  tags,
  videoTags,
  videoTasks,
  videos,
} from "@/server/db/schema";

import { AMQP } from "@/constants/amqp";
import { TRAILER_CONFIG, type TrailerConfig, WEBVTT_CONFIG, type WebVTTConfig } from "@/constants/video";

export const createUploadVideoProcedure = () => {
  return publicProcedure
    .input(
      zfd.formData({
        file: zfd.file(),
        title: zfd.text(),
        description: zfd.text(z.string().optional()),
        tags: zfd.repeatableOfType(z.string()).optional(),
        categories: zfd.repeatableOfType(z.string()).optional(),
        models: zfd.repeatableOfType(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      interface MqVideoTaskConfig {
        webvtt?: WebVTTConfig;
        trailer?: TrailerConfig;
      }

      interface MqVideoTask {
        videoId: number;
        taskType: VideoTaskType;
        filePath: string;
        outputPath: string;
        config?: MqVideoTaskConfig;
      }

      const file = await writeFile(input.file).saveTo(env.UPLOADS_VOLUME).saveAs("video");

      const createdVideo = await ctx.db.transaction(
        async (tx) => {
          // Create video record
          const [createdVideo] = await tx
            .insert(videos)
            .values({
              url: file.url,
              status: "pending",
              title: input.title,
              description: input.description,
            })
            .returning({ id: videos.id });

          if (!createdVideo) {
            throw new Error("Failed to create video record");
          }

          // Create task records
          const dbTasks: DBCreateVideoTaskSchema[] = [
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
          const tasksPromise = tx.insert(videoTasks).values(dbTasks);

          const tagsPromise = Promise.resolve().then(async () => {
            if (!input.tags) {
              return;
            }

            // Get existing tags
            const existingTags = await tx.select({ id: tags.id }).from(tags).where(inArray(tags.name, input.tags));

            // Create new tags
            const newTags = await tx
              .insert(tags)
              .values(input.tags.map((tag) => ({ name: tag })))
              .returning({ id: tags.id })
              .onConflictDoNothing();

            // Combine existing and new tags
            const allTags = [...existingTags, ...(newTags ?? [])];

            // Create video-tag relations
            await tx.insert(videoTags).values(
              allTags.map((tag) => ({
                tagId: tag.id,
                videoId: createdVideo.id,
              })),
            );
          });

          const categoriesPromise = Promise.resolve().then(async () => {
            if (!input.categories) {
              return;
            }

            // Create video-category relations
            await tx
              .insert(categoryVideos)
              .values(input.categories.map((category) => ({ categoryId: Number(category), videoId: createdVideo.id })));
          });

          const modelsPromise = Promise.resolve().then(async () => {
            if (!input.models) {
              return;
            }

            // Create video-model relations
            await tx
              .insert(modelVideos)
              .values(input.models.map((model) => ({ modelId: Number(model), videoId: createdVideo.id })));
          });

          await Promise.all([tasksPromise, tagsPromise, categoriesPromise, modelsPromise]);

          return createdVideo;
        },
        {
          accessMode: "read write",
          isolationLevel: "repeatable read",
        },
      );

      // Prepare tasks for RabbitMQ
      const mqTasks: MqVideoTask[] = [
        {
          videoId: createdVideo.id,
          taskType: "poster",
          filePath: file.path,
          outputPath: path.dirname(file.path),
        },
        {
          videoId: createdVideo.id,
          taskType: "webvtt",
          filePath: file.path,
          outputPath: path.dirname(file.path),
          config: { webvtt: WEBVTT_CONFIG },
        },
        {
          videoId: createdVideo.id,
          taskType: "trailer",
          filePath: file.path,
          outputPath: path.dirname(file.path),
          config: { trailer: TRAILER_CONFIG },
        },
        {
          videoId: createdVideo.id,
          taskType: "duration",
          filePath: file.path,
          outputPath: path.dirname(file.path),
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
    });
};
