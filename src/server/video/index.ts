import { env } from "@/env";
import { EventEmitter } from "events";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const context = globalThis as unknown as {
  videoEvents: EventEmitter | undefined;
  videoTasks: Map<string, Set<string>> | undefined;
};

export const videoTasks = createVideoTasks();
export const videoEvents = createVideoEvents();

function createVideoEvents() {
  const events = context.videoEvents ?? new EventEmitter();
  if (env.NODE_ENV !== "production") context.videoEvents = events;
  return events;
}

function createVideoTasks() {
  const tasks = context.videoTasks ?? new Map<string, Set<string>>();
  if (env.NODE_ENV !== "production") context.videoTasks = tasks;
  return tasks;
}
