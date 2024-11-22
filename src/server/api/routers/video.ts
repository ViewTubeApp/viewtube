import "server-only";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { videos } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { zfd } from "zod-form-data";
import {
  createPoster,
  createTrailer,
  createWebVTT,
  writeFileToDisk,
} from "@/lib/file";
import { env } from "@/env";
import { RELATED_LOAD_COUNT } from "@/constants/shared";

export const videoRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        title: z.string(),
        url: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(videos).values({
        title: input.title,
        url: input.url,
      });
    }),

  latest: publicProcedure
    .input(
      z.object({
        count: z.number().min(1).max(1024),
        query: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const params: Parameters<
        Awaited<typeof ctx.db.query.videos.findMany>
      >[0] = {
        limit: input.count,
        orderBy: (videos, { desc }) => [desc(videos.createdAt)],
      };

      if (input.query) {
        params.where = (videos, { ilike, or }) => {
          return or(ilike(videos.title, "%" + input.query + "%"));
        };
      }

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

  upload: publicProcedure
    .input(
      zfd.formData({
        file: zfd.file(),
      }),
    )
    .mutation(async ({ input }) => {
      const file = await writeFileToDisk(input.file, env.ROOT_PATH);
      const poster = await createPoster(file.url, env.ROOT_PATH);
      const vtt = await createWebVTT(file.url, env.ROOT_PATH);
      const trailer = await createTrailer(file.url, env.ROOT_PATH);
      return { file, poster, trailer, ...vtt };
    }),
});
