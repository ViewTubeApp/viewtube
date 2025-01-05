import { env } from "@/env";
import { getDatabaseUrl } from "@/utils/server/db";
import { type Config } from "drizzle-kit";

export default {
  schema: "./src/server/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl({
      db: env.POSTGRES_DB,
      user: env.POSTGRES_USER,
      host: env.POSTGRES_HOST,
      port: env.POSTGRES_PORT,
      password: env.POSTGRES_PASSWORD,
      passwordFile: env.POSTGRES_PASSWORD_FILE,
    }),
  },
  tablesFilter: ["viewtube_*"],
} satisfies Config;
