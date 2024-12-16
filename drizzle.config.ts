import { type Config } from "drizzle-kit";

import { getDatabaseUrl } from "@/lib/db";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: getDatabaseUrl() },
  tablesFilter: ["viewtube_*"],
} satisfies Config;
