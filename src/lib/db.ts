import fs from "fs";
import { env } from "@/env";

export function getDatabaseUrl() {
  let password = env.POSTGRES_PASSWORD;

  if (!password && env.POSTGRES_PASSWORD_FILE) {
    password = fs.readFileSync(env.POSTGRES_PASSWORD_FILE, "utf8").trim();
  }

  return `postgresql://${env.POSTGRES_USER}:${password}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`;
}

export function getRedisUrl() {
  let password = env.REDIS_PASSWORD;

  if (!password && env.REDIS_PASSWORD_FILE) {
    password = fs.readFileSync(env.REDIS_PASSWORD_FILE, "utf-8").trim();
  }

  return `redis://:${password}@${env.REDIS_HOST}:${env.REDIS_PORT}`;
}
