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
  clipDuration: number;
  clipCount: number;
  selectionStrategy: "uniform" | "random";
  width: number;
  height: number;
  targetDuration: number;
  aspectRatioStrategy: "fit" | "crop" | "stretch";
  maxWidth: number;
  maxHeight: number;
}

export interface WebVTTResult {
  thumbnails_vtt: UploadedFileData;
  storyboard_image: UploadedFileData;
}

export interface ProcessVideoPayload {
  videoId: number;
  fileKey: string;
  videoUrl: string;
}

export const FILE_TYPES = {
  IMAGE: "image/jpeg",
  VIDEO: "video/mp4",
  TEXT: "text/plain",
} as const;
