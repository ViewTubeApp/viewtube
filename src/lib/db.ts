import fs from "fs";
import { env } from "@/env";
import { match, P } from "ts-pattern";

export function getDatabaseUrl() {
  const password = match(env.POSTGRES_PASSWORD_FILE)
    .with(P.nullish, () => env.POSTGRES_PASSWORD)
    .with(P.string, (file) => fs.readFileSync(file, "utf-8").trim())
    .exhaustive();

  return `postgresql://${env.POSTGRES_USER}:${password}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`;
}
