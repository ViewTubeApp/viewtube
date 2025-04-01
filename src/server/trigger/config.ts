import { type TrailerConfig, type WebVTTConfig } from "./types";

export const DEFAULT_WEBVTT_CONFIG: WebVTTConfig = {
  thumbnails: 25,
  columns: 5,
  width: 160,
  height: 90,
};

export const DEFAULT_TRAILER_CONFIG: TrailerConfig = {
  clipDuration: 3.0,
  clipCount: 5,
  selectionStrategy: "uniform",
  width: 640,
  height: 360,
  targetDuration: 15.0,
  aspectRatioStrategy: "fit",
  maxWidth: 1280,
  maxHeight: 720,
};
