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
};

export const redisSub = createRedisSubConnection();
export const redisPub = createRedisPubConnection();

function createRedisPubConnection() {
  const conn = context.redisPub ?? new Redis(getRedisUrl());
  if (env.NODE_ENV !== "production") context.redisPub = conn;
  conn.on("connect", () => log.info("Redis publisher connection established"));
  conn.on("error", (err: Error) => log.error({ err }, "Redis publisher connection error"));
  return conn;
}

function createRedisSubConnection() {
  const conn = context.redisSub ?? new Redis(getRedisUrl());
  if (env.NODE_ENV !== "production") context.redisSub = conn;
  conn.on("connect", () => log.info("Redis subscriber connection established"));
  conn.on("error", (err: Error) => log.error({ err }, "Redis subscriber connection error"));
  return conn;
}
