import { type UploadedFileData } from "uploadthing/types";

export type VideoProcessingError =
  | { type: "FETCH_ERROR"; message: string }
  | { type: "PROBE_ERROR"; message: string }
  | { type: "FFMPEG_ERROR"; message: string }
  | { type: "UPLOAD_ERROR"; message: string }
  | { type: "FILE_SYSTEM_ERROR"; message: string }
  | { type: "DATABASE_ERROR"; message: string };

export interface WebVTTConfig {
  width: number;
  height: number;
  columns: number;
  thumbnails: number;
}

export interface TrailerConfig {
  clip_duration: number;
  clip_count: number;
  selection_strategy: "uniform" | "random";
  width: number;
  height: number;
  target_duration: number;
  aspect_ratio_strategy: "fit" | "crop" | "stretch";
  max_width: number;
  max_height: number;
}

export interface WebVTTResult {
  thumbnails_vtt: UploadedFileData;
  storyboard_image: UploadedFileData;
}

export interface ProcessVideoPayload {
  id: number;
  file_key: string;
  url: string;
}

export interface ProcessVideoOptions {
  compress?: boolean;
}

export const FILE_TYPES = {
  IMAGE: "image/jpeg",
  VIDEO: "video/mp4",
  TEXT: "text/plain",
} as const;
