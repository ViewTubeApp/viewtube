/**
 * Configuration for generating WebVTT preview sprites
 */
export interface WebVTTConfig {
  /** Interval between sprites in seconds (e.g. 10 means take a sprite every 10 seconds) */
  interval: number;

  /** Number of sprite columns in the sprite sheet (e.g. 5 means 5 sprites per row) */
  numColumns: number;

  /** Width of each individual sprite in pixels */
  width: number;

  /** Height of each individual sprite in pixels */
  height: number;

  /** Maximum duration in seconds to process (optional, defaults to entire video) */
  maxDuration?: number;
}

/**
 * Configuration for generating video trailer
 */
export interface TrailerConfig {
  /** Duration of each clip in seconds */
  clipDuration: number;

  /** Number of clips to include in the trailer */
  clipCount: number;

  /** Strategy for selecting clips: "uniform" takes evenly spaced clips, "random" picks random segments */
  selectionStrategy: "uniform" | "random";

  /** Width of the output video in pixels */
  width: number;

  /** Height of the output video in pixels */
  height: number;

  /** Target duration of the final trailer in seconds (optional, defaults to clipDuration * clipCount) */
  targetDuration?: number;

  /**
   * Aspect ratio handling strategy (optional)
   * - "fit": Maintain aspect ratio and fit within dimensions (may add letterboxing/pillarboxing)
   * - "crop": Maintain aspect ratio and crop to fill dimensions
   * - "stretch": Stretch to fill dimensions (may distort)
   * Default: "fit"
   */
  aspectRatioStrategy?: "fit" | "crop" | "stretch";

  /** Maximum width for any video (landscape or portrait) */
  maxWidth?: number;

  /** Maximum height for any video (landscape or portrait) */
  maxHeight?: number;
}

export const WEBVTT_CONFIG: WebVTTConfig = {
  interval: 10,
  numColumns: 5,
  width: 160,
  height: 90,
  maxDuration: 3600,
};

export const TRAILER_CONFIG: TrailerConfig = {
  width: 1280,
  height: 720,
  clipCount: 10,
  clipDuration: 3,
  maxWidth: 1280,
  maxHeight: 1280,
  aspectRatioStrategy: "fit",
  selectionStrategy: "uniform",
};
