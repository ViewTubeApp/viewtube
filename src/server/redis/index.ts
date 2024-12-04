import { env } from "@/env";
import { getRedisUrl } from "@/lib/db";
import Redis from "ioredis";
import { log } from "@/server/logger";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const context = globalThis as unknown as {
  redisPub: Redis | undefined;
  redisSub: Redis | undefined;
  videoTasks: Redis | undefined;
};

const pubConn = context.redisPub ?? new Redis(getRedisUrl(0));
if (env.NODE_ENV !== "production") context.redisPub = pubConn;
pubConn.once("connect", () => log.info("Redis publisher connection established"));
pubConn.once("error", (err: Error) => log.error({ err }, "Redis publisher connection error"));

const subConn = context.redisSub ?? new Redis(getRedisUrl(0));
if (env.NODE_ENV !== "production") context.redisSub = subConn;
subConn.once("connect", () => log.info("Redis subscriber connection established"));
subConn.once("error", (err: Error) => log.error({ err }, "Redis subscriber connection error"));

const videoTasksConn = context.videoTasks ?? new Redis(getRedisUrl(1));
if (env.NODE_ENV !== "production") context.videoTasks = videoTasksConn;
videoTasksConn.once("connect", () => log.info("Redis video tasks connection established"));
videoTasksConn.once("error", (err: Error) => log.error({ err }, "Redis video tasks connection error"));

export const redisSub = subConn;
export const redisPub = pubConn;
export const videoTasks = videoTasksConn;
