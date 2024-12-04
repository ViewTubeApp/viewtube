export interface WebVTTConfig {
  interval: number;
  numColumns: number;
  width: number;
  height: number;
}

export const WEBVTT_CONFIG: WebVTTConfig = {
  interval: 1,
  numColumns: 5,
  width: 160,
  height: 90,
};

export const TASK_MAX_RETRIES = 3;
export const TASK_RETRY_DELAY = 1000; // ms
