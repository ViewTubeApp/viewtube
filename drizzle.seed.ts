import { getDatabaseUrl } from "@/utils/server/db";
import dotenv from "@dotenvx/dotenvx";
import { drizzle } from "drizzle-orm/postgres-js";
import { reset, seed } from "drizzle-seed";
import postgres from "postgres";

import * as schema from "@/server/db/schema";
import { log } from "@/server/logger";

dotenv.config();

async function main() {
  const url = getDatabaseUrl({
    db: process.env.POSTGRES_DB!,
    user: process.env.POSTGRES_USER!,
    host: process.env.POSTGRES_HOST!,
    port: process.env.POSTGRES_PORT!,
    password: process.env.POSTGRES_PASSWORD,
    passwordFile: process.env.POSTGRES_PASSWORD_FILE,
  });

  log.info(`Database URL: ${url}`);

  const db = drizzle(postgres(url));

  log.start("Resetting database...");
  await reset(db, schema);
  log.success("Database reset");

  if (process.env.SKIP_SEED) {
    log.info("Skipping seeding");
    return;
  }

  log.start("Seeding database...");
  await seed(db, schema).refine((f) => ({
    categories: {
      count: 32,
      columns: { slug: f.companyName({ isUnique: true }) },
    },
    models: {
      count: 128,
      columns: { name: f.firstName({ isUnique: true }) },
    },
    tags: {
      count: 32,
      columns: { name: f.lastName({ isUnique: true }) },
    },
    videos: {
      count: 512,
      columns: {
        title: f.loremIpsum({ sentencesCount: 1 }),
        description: f.loremIpsum({ sentencesCount: 10 }),
        viewsCount: f.int({ minValue: 1_000, maxValue: 1_000_000 }),
        likesCount: f.int({ minValue: 1_000, maxValue: 1_000_000 }),
        dislikesCount: f.int({ minValue: 1_000, maxValue: 1_000_000 }),
        videoDuration: f.int({ minValue: 10, maxValue: 3600 }),
      },
    },
  }));
  log.success("Database seeded");
}

main().catch((error) => {
  log.error("Error seeding database", error);
  process.exit(1);
});
