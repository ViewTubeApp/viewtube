import { env } from "@/env";
import { getRedisUrl } from "@/lib/db";
import Redis from "ioredis";

const context = globalThis as unknown as {
  pubRedis: Redis | undefined;
  subRedis: Redis | undefined;
};

const pubConn = context.pubRedis ?? new Redis(getRedisUrl());
const subConn = context.subRedis ?? new Redis(getRedisUrl());

if (env.NODE_ENV !== "production") {
  context.pubRedis = pubConn;
  context.subRedis = subConn;
}

export const pubRedis = pubConn;
export const subRedis = subConn;
