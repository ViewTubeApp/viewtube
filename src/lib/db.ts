import fs from "node:fs";
import { env } from "@/env";

export function getDatabaseUrl() {
  let password = env.POSTGRES_PASSWORD;

  if (!password && env.POSTGRES_PASSWORD_FILE) {
    password = fs.readFileSync(env.POSTGRES_PASSWORD_FILE, "utf8").trim();
  }

  return `postgresql://${env.POSTGRES_USER}:${password}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`;
}
