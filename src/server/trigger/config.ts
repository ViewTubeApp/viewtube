import { type TrailerConfig, type WebVTTConfig } from "./types";

export const DEFAULT_WEBVTT_CONFIG: WebVTTConfig = {
  thumbnails: 25,
  columns: 5,
  width: 160,
  height: 90,
};

export const DEFAULT_TRAILER_CONFIG: TrailerConfig = {
  clip_duration: 3.0,
  clip_count: 5,
  selection_strategy: "uniform",
  width: 640,
  height: 360,
  target_duration: 15.0,
  aspect_ratio_strategy: "fit",
  max_width: 1280,
  max_height: 720,
};
