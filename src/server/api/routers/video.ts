import { IterableEventEmitter } from "@/utils/server/events";
import "server-only";

import { createTRPCRouter } from "@/server/api/trpc";

import { createCreateVideoProcedure } from "./procedures/video/createVideo";
import { createDeleteVideoProcedure } from "./procedures/video/deleteVideo";
import { createGetRelatedVideoListProcedure } from "./procedures/video/getRelatedVideoList";
import { type VideoByIdResponse, createGetVideoByIdProcedure } from "./procedures/video/getVideoById";
import { createGetVideoListProcedure } from "./procedures/video/getVideoList";
import { createLikeDislikeVideoProcedure } from "./procedures/video/likeDislikeVideo";
import { createUpdateVideoProcedure } from "./procedures/video/updateVideo";
import { createViewVideoProcedure } from "./procedures/video/viewVideo";
import { createOnVideoUpdatedSubscription } from "./subscriptions/video/onVideoUpdated";

export const ee = new IterableEventEmitter<{
  update: [data: VideoByIdResponse];
}>();

export const videoRouter = createTRPCRouter({
  getVideoList: createGetVideoListProcedure(),
  getVideoById: createGetVideoByIdProcedure(),
  createVideo: createCreateVideoProcedure(),
  updateVideo: createUpdateVideoProcedure(),
  deleteVideo: createDeleteVideoProcedure(),
  onVideoUpdated: createOnVideoUpdatedSubscription({ ee }),
  likeVideo: createLikeDislikeVideoProcedure({ ee, type: "like" }),
  dislikeVideo: createLikeDislikeVideoProcedure({ ee, type: "dislike" }),
  viewVideo: createViewVideoProcedure(),
  getRelatedVideoList: createGetRelatedVideoListProcedure(),
});

export type * from "./procedures/video/getVideoList";
export type * from "./procedures/video/getVideoById";
export type * from "./procedures/video/updateVideo";
export type * from "./procedures/video/deleteVideo";
export type * from "./procedures/video/likeDislikeVideo";
export type * from "./subscriptions/video/onVideoUpdated";
export type * from "./procedures/video/viewVideo";
export type * from "./procedures/video/getRelatedVideoList";
