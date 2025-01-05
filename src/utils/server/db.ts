import { pgTableCreator } from "drizzle-orm/pg-core";
import fs from "fs";
import { P, match } from "ts-pattern";

interface DatabaseUrlOptions {
  user: string;
  host: string;
  port: string;
  db: string;
  password?: string;
  passwordFile?: string;
}

export function getDatabaseUrl(options: DatabaseUrlOptions) {
  const password = match(options.passwordFile)
    .with(P.nullish, () => options.password)
    .with(P.string, (file) => fs.readFileSync(file, "utf-8").trim())
    .exhaustive();

  return `postgresql://${options.user}:${password}@${options.host}:${options.port}/${options.db}`;
}

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `viewtube_${name}`);
