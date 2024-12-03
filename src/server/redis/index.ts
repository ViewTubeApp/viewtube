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

const pubConn = context.redisPub ?? new Redis(getRedisUrl());
if (env.NODE_ENV !== "production") context.redisPub = pubConn;
pubConn.once("connect", () => log.info("Redis publisher connection established"));
pubConn.once("error", (err: Error) => log.error({ err }, "Redis publisher connection error"));

const subConn = context.redisSub ?? new Redis(getRedisUrl());
if (env.NODE_ENV !== "production") context.redisSub = subConn;
subConn.once("connect", () => log.info("Redis subscriber connection established"));
subConn.once("error", (err: Error) => log.error({ err }, "Redis subscriber connection error"));

export const redisSub = subConn;
export const redisPub = pubConn;
