import { env } from "@/env";
import { pgTableCreator } from "drizzle-orm/pg-core";
import fs from "fs";
import { P, match } from "ts-pattern";

export function getDatabaseUrl() {
  const password = match(env.POSTGRES_PASSWORD_FILE)
    .with(P.nullish, () => env.POSTGRES_PASSWORD)
    .with(P.string, (file) => fs.readFileSync(file, "utf-8").trim())
    .exhaustive();

  return `postgresql://${env.POSTGRES_USER}:${password}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`;
}

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `viewtube_${name}`);
