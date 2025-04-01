import { IterableEventEmitter } from "@/utils/server/events";
import "server-only";

import { createTRPCRouter } from "@/server/api/trpc";

import { createCreateVideoProcedure } from "./procedures/video/create-video";
import { createDeleteVideoProcedure } from "./procedures/video/delete-video";
import { createGetRelatedVideoListProcedure } from "./procedures/video/get-related-video-list";
import { type VideoByIdResponse, createGetVideoByIdProcedure } from "./procedures/video/get-video-by-id";
import { createGetVideoListProcedure } from "./procedures/video/get-video-list";
import { createUpdateVideoProcedure } from "./procedures/video/update-video";
import { createViewVideoProcedure } from "./procedures/video/view-video";
import { createVoteVideoProcedure } from "./procedures/video/vote-video";
import { createOnVideoUpdatedSubscription } from "./subscriptions/video/on-video-updated";

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
  likeVideo: createVoteVideoProcedure({ ee, type: "like" }),
  dislikeVideo: createVoteVideoProcedure({ ee, type: "dislike" }),
  viewVideo: createViewVideoProcedure(),
  getRelatedVideoList: createGetRelatedVideoListProcedure(),
});

export type * from "./procedures/video/get-video-list";
export type * from "./procedures/video/get-video-by-id";
export type * from "./procedures/video/update-video";
export type * from "./procedures/video/delete-video";
export type * from "./procedures/video/vote-video";
export type * from "./subscriptions/video/on-video-updated";
export type * from "./procedures/video/view-video";
export type * from "./procedures/video/get-related-video-list";
