import { and, asc, desc, eq, exists, gt, ilike, inArray, lt, or } from "drizzle-orm";
import { type SQL, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { match } from "ts-pattern";

import { type DatabaseType } from "@/server/db";
import {
  categories,
  category_videos,
  model_videos,
  models,
  tags,
  video_tags,
  video_votes,
  videos,
} from "@/server/db/schema";

import { type GetVideoListSchema } from "../procedures/video/get-video-list";

/**
 * Manages video tags - creates new ones if needed and assigns them to the video
 */
export const manageVideoTags = async (db: DatabaseType, videoId: number, tagNames: string[]) => {
  // Always delete existing tags
  await db.delete(video_tags).where(eq(video_tags.video_id, videoId));

  // Only insert new tags if there are any
  if (tagNames.length) {
    // Get existing tags by name
    const existingTags = await db
      .select({ id: tags.id, name: tags.name })
      .from(tags)
      .where(inArray(tags.name, tagNames));

    const existingTagNames = existingTags.map((tag) => tag.name);
    const newTagNames = tagNames.filter((tagName) => !existingTagNames.includes(tagName));

    // Create new tags only if we have new ones
    const newTags =
      newTagNames.length ?
        await db
          .insert(tags)
          .values(newTagNames.map((name) => ({ name })))
          .$returningId()
      : [];

    // Insert video tags (both existing and new)
    if (existingTags.length || newTags.length) {
      await db.insert(video_tags).values(
        [...existingTags, ...newTags].map((tag) => ({
          tag_id: tag.id,
          video_id: videoId,
        })),
      );
    }
  }
};

/**
 * Manages video categories assignments
 */
export const manageVideoCategories = async (db: DatabaseType, videoId: number, categoryIds: number[]) => {
  // Always delete existing categories
  await db.delete(category_videos).where(eq(category_videos.video_id, videoId));

  // Only insert new categories if there are any
  if (categoryIds.length) {
    await db
      .insert(category_videos)
      .values(categoryIds.map((category) => ({ category_id: category, video_id: videoId })));
  }
};

/**
 * Manages video models assignments
 */
export const manageVideoModels = async (db: DatabaseType, videoId: number, modelIds: number[]) => {
  // Always delete existing models
  await db.delete(model_videos).where(eq(model_videos.video_id, videoId));

  // Only insert new models if there are any
  if (modelIds.length) {
    await db.insert(model_videos).values(modelIds.map((model) => ({ model_id: model, video_id: videoId })));
  }
};

/**
 * Builds filter conditions for video list query
 */
export const buildVideoListFilters = (db: DatabaseType, input: GetVideoListSchema) => {
  const filters: Array<SQL | undefined> = [];

  // Filter by query
  if (input.query) {
    const tq = db
      .select()
      .from(tags)
      .where(and(eq(tags.id, video_tags.tag_id), ilike(tags.name, "%" + input.query + "%")));

    const cq = db
      .select()
      .from(categories)
      .where(and(eq(categories.id, category_videos.category_id), ilike(categories.slug, "%" + input.query + "%")));

    const mq = db
      .select()
      .from(models)
      .where(and(eq(models.id, model_videos.model_id), ilike(models.name, "%" + input.query + "%")));

    filters.push(
      or(
        // Filter by title
        ilike(videos.title, "%" + input.query + "%"),
        // Filter by description
        ilike(videos.description, "%" + input.query + "%"),
        // Filter by tag name
        exists(
          db
            .select()
            .from(video_tags)
            .where(and(eq(video_tags.video_id, videos.id), exists(tq))),
        ),
        // Filter by category name
        exists(
          db
            .select()
            .from(category_videos)
            .where(and(eq(category_videos.video_id, videos.id), exists(cq))),
        ),
        // Filter by model name
        exists(
          db
            .select()
            .from(model_videos)
            .where(and(eq(model_videos.video_id, videos.id), exists(mq))),
        ),
      ),
    );
  }

  // Filter by status
  if (input.status) {
    filters.push(inArray(videos.status, input.status));
  } else {
    filters.push(eq(videos.status, "completed"));
  }

  // Filter by category id
  if (input.category) {
    filters.push(
      exists(
        db
          .select()
          .from(category_videos)
          .where(
            and(
              eq(category_videos.video_id, alias(videos, "videos").id),
              eq(category_videos.category_id, input.category),
            ),
          ),
      ),
    );
  }

  // Filter by model id
  if (input.model) {
    filters.push(
      exists(
        db
          .select()
          .from(model_videos)
          .where(and(eq(model_videos.video_id, alias(videos, "videos").id), eq(model_videos.model_id, input.model))),
      ),
    );
  }

  // Filter by tag id
  if (input.tag) {
    filters.push(
      exists(
        db
          .select()
          .from(video_tags)
          .where(and(eq(video_tags.video_id, alias(videos, "videos").id), eq(video_tags.tag_id, input.tag))),
      ),
    );
  }

  // Filter by cursor
  if (input.cursor) {
    const fn = match(input)
      .with({ sortOrder: "desc" }, () => lt)
      .with({ sortOrder: "asc" }, () => gt)
      .exhaustive();

    filters.push(fn(videos.id, input.cursor));
  }

  return and(...filters);
};

/**
 * Builds sort conditions for video list query
 */
export const buildVideoListSort = (_: DatabaseType, input: GetVideoListSchema) => {
  const fn = match(input)
    .with({ sortOrder: "desc" }, () => desc)
    .with({ sortOrder: "asc" }, () => asc)
    .exhaustive();

  const prop = input.sortBy ?? "created_at";

  return [fn(videos[prop]), fn(videos.id)];
};

/**
 * Builds base query for video list with all relationships and extras
 */
export const buildVideoListQuery = (db: DatabaseType, input: GetVideoListSchema) => {
  return db.query.videos.findMany({
    limit: input.limit + 1,
    offset: input.offset,
    with: {
      video_votes: true,
      video_tags: { with: { tag: true } },
      model_videos: { with: { model: true } },
      category_videos: { with: { category: true } },
    },
    extras: {
      likes_count: sql<number>`(
        SELECT COUNT(*)
        FROM ${video_votes} vv
        WHERE vv.video_id = ${videos.id}
        AND vv.vote_type = 'like'
      )`.as("likes_count"),
      dislikes_count: sql<number>`(
        SELECT COUNT(*)
        FROM ${video_votes} vv
        WHERE vv.video_id = ${videos.id}
        AND vv.vote_type = 'dislike'
      )`.as("dislikes_count"),
    },
    orderBy: buildVideoListSort(db, input),
    where: buildVideoListFilters(db, input),
  });
};
