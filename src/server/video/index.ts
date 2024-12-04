import { env } from "@/env";
import { EventEmitter } from "events";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const context = globalThis as unknown as {
  videoEvents: EventEmitter | undefined;
};

const events = context.videoEvents ?? new EventEmitter();
if (env.NODE_ENV !== "production") context.videoEvents = events;

export const videoEvents = events;
