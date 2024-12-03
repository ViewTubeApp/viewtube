import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";
import * as schema from "./schema";
import { getDatabaseUrl, getRedisUrl } from "@/lib/db";
import Redis from "ioredis";
import { log } from "@/lib/logger";
import { EventEmitter } from "events";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const context = globalThis as unknown as {
  redisPub: Redis | undefined;
  redisSub: Redis | undefined;
  db: postgres.Sql | undefined;
  videoEvents: EventEmitter | undefined;
  videoTasks: Map<string, Set<string>> | undefined;
};

function createDbConnection() {
  const conn = context.db ?? postgres(getDatabaseUrl());
  if (env.NODE_ENV !== "production") context.db = conn;
  return drizzle(conn, { schema });
}

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

export const db = createDbConnection();

export const redisSub = createRedisSubConnection();
export const redisPub = createRedisPubConnection();

export const videoTasks = createVideoTasks();
export const videoEvents = createVideoEvents();
