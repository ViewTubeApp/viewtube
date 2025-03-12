import "server-only";

import { createTRPCRouter } from "@/server/api/trpc";

import { IterableEventEmitter } from "@/lib/events";

import { createDeleteVideoProcedure } from "./procedures/video/deleteVideo";
import { type VideoByIdResponse, createGetVideoByIdProcedure } from "./procedures/video/getVideoById";
import { createGetVideoListProcedure } from "./procedures/video/getVideoList";
import { createIncrementViewsCountProcedure } from "./procedures/video/incrementViewsCount";
import { createLikeDislikeVideoProcedure } from "./procedures/video/likeDislikeVideo";
import { createUpdateVideoProcedure } from "./procedures/video/updateVideo";
import { createUploadVideoProcedure } from "./procedures/video/uploadVideo";
import { createOnVideoUpdatedSubscription } from "./subscriptions/video/onVideoUpdated";

export const ee = new IterableEventEmitter<{
  update: [data: VideoByIdResponse];
}>();

export const videoRouter = createTRPCRouter({
  getVideoList: createGetVideoListProcedure(),
  getVideoById: createGetVideoByIdProcedure(),
  uploadVideo: createUploadVideoProcedure(),
  updateVideo: createUpdateVideoProcedure(),
  deleteVideo: createDeleteVideoProcedure(),
  onVideoUpdated: createOnVideoUpdatedSubscription({ ee }),
  likeVideo: createLikeDislikeVideoProcedure({ ee, type: "like" }),
  dislikeVideo: createLikeDislikeVideoProcedure({ ee, type: "dislike" }),
  incrementViewsCount: createIncrementViewsCountProcedure(),
});

export type * from "./procedures/video/getVideoList";
export type * from "./procedures/video/getVideoById";
export type * from "./procedures/video/uploadVideo";
export type * from "./procedures/video/updateVideo";
export type * from "./procedures/video/deleteVideo";
export type * from "./procedures/video/likeDislikeVideo";
export type * from "./subscriptions/video/onVideoUpdated";
